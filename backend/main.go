package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var ctx = context.Background()

var regexpNonAlpha = regexp.MustCompile(`[^a-z0-9\s-]`)
var regexpWhitespace = regexp.MustCompile(`[\s-]+`)

func slugify(text string) string {
	text = strings.ToLower(text)
	text = regexpNonAlpha.ReplaceAllString(text, "")
	text = regexpWhitespace.ReplaceAllString(text, "-")
	return strings.Trim(text, "-")
}

var regexpHTMLTags = regexp.MustCompile(`<[^>]*>`)

func sanitize(text string) string {
	// Remove HTML tags
	text = regexpHTMLTags.ReplaceAllString(text, "")
	// Trim spaces
	return strings.TrimSpace(text)
}

func ipRateLimiter(limit time.Duration) gin.HandlerFunc {
	type client struct {
		lastSeen time.Time
	}
	var mutex sync.Mutex
	clients := make(map[string]*client)

	// Clean up routine to prevent memory leaks
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			mutex.Lock()
			for ip, c := range clients {
				if time.Since(c.lastSeen) > 5*time.Minute {
					delete(clients, ip)
				}
			}
			mutex.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		mutex.Lock()
		cli, exists := clients[ip]
		if !exists {
			clients[ip] = &client{lastSeen: time.Now()}
			mutex.Unlock()
			c.Next()
			return
		}

		if time.Since(cli.lastSeen) < limit {
			mutex.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Muitas requisições. Por favor, aguarde um momento.",
			})
			return
		}

		cli.lastSeen = time.Now()
		mutex.Unlock()
		c.Next()
	}
}

func cacheControl() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		if path == "/poem" || path == "/ranking" || strings.HasPrefix(path, "/poema/") || strings.HasPrefix(path, "/poem/") || path == "/poem/live" {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		} else if path == "/" {
			c.Header("Cache-Control", "public, max-age=300")
		}
		c.Next()
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func adminAuth() gin.HandlerFunc {
	adminPassword := getEnv("ADMIN_PASSWORD", "bankai")
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != adminPassword {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Acesso negado. Senha de administrador inválida.",
			})
			return
		}
		c.Next()
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Origin", frontendURL)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// --- BROKER SSE (FASE 4 - Tempo Real) ---
type SSEBroker struct {
	clients        map[chan string]bool
	newClients     chan chan string
	defunctClients chan chan string
	messages       chan string
}

func newSSEBroker() *SSEBroker {
	return &SSEBroker{
		clients:        make(map[chan string]bool),
		newClients:     make(chan chan string),
		defunctClients: make(chan chan string),
		messages:       make(chan string),
	}
}

func (b *SSEBroker) Start() {
	for {
		select {
		case s := <-b.newClients:
			b.clients[s] = true
		case s := <-b.defunctClients:
			delete(b.clients, s)
			close(s)
		case msg := <-b.messages:
			for s := range b.clients {
				s <- msg
			}
		}
	}
}

// --- WORKER DE EVENTOS (FASE 3 e 4 e 5) ---
func startEventWorker(rdb *redis.Client, broker *SSEBroker) {
	fmt.Println("👷 Worker Iniciado (Escutando Eventos)...")
	lastID := "$"
	
	for {
		streams, err := rdb.XRead(ctx, &redis.XReadArgs{
			Streams: []string{"poems:stream", lastID},
			Count:   5, // Lendo em lotes
			Block:   0,
		}).Result()

		if err != nil {
			continue
		}

		for _, stream := range streams {
			for _, message := range stream.Messages {
				lastID = message.ID
				
				switch message.Values["event"] {

				case "PoemCreated":
					poemID := message.Values["poem_id"].(string)
					content := message.Values["content"].(string)
					authorName := message.Values["author_name"].(string)
					
					var contentJP, contentRO, contentEN, contentPT string
					if val, ok := message.Values["content_jp"].(string); ok { contentJP = val }
					if val, ok := message.Values["content_ro"].(string); ok { contentRO = val }
					if val, ok := message.Values["content_en"].(string); ok { contentEN = val }
					if val, ok := message.Values["content_pt"].(string); ok { contentPT = val }
					
					slug := slugify(content)

					// FASE 6: Sincroniza no Cache (Redis Hash + Set de IDs)
					poemKey := fmt.Sprintf("poem:%s", poemID)
					err := rdb.HSet(ctx, poemKey, map[string]interface{}{
						"id":          poemID,
						"content":     content,
						"author_name": authorName,
						"content_jp":  contentJP,
						"content_ro":  contentRO,
						"content_en":  contentEN,
						"content_pt":  contentPT,
						"slug":        slug,
					}).Err()

					if err == nil {
						rdb.SAdd(ctx, "poems:available_ids", poemID)
						fmt.Printf("✅ Sincronizado no Cache: %s (ID: %s)\n", content, poemID)
						// FASE 4: Alerta clientes
						formattedContent := fmt.Sprintf("%s - %s", content, authorName)
						broker.messages <- formattedContent
					}

				case "PoemViewed":
					// FASE 5: Analytics sem travar o banco!
					poemID := message.Values["poem_id"].(string)
					
					// Incrementa de forma atômica e absurdamente rápida um ranking no Redis
					// ZINCRBY (Sorted Set) gerencia o ranking automaticamente
					newScore, err := rdb.ZIncrBy(ctx, "leaderboard:poems", 1, poemID).Result()
					if err == nil {
						fmt.Printf("📊 Analytics: Poema ID %s lido. Pontuação atual: %.0f visualizações.\n", poemID, newScore)
					}
				}
			}
		}
	}
}

// --- MODELOS DE DADOS (PostgreSQL) ---
type Author struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Name  string `gorm:"unique;not null" json:"name"`
	Poems []Poem `json:"-"` // Oculta na resposta JSON
}

type Poem struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Content   string `gorm:"not null" json:"content"`
	ContentJP string `gorm:"column:content_jp" json:"content_jp"`
	ContentRO string `gorm:"column:content_ro" json:"content_ro"`
	ContentEN string `gorm:"column:content_en" json:"content_en"`
	ContentPT string `gorm:"column:content_pt" json:"content_pt"`
	AuthorID  uint   `json:"author_id"`
	Author    Author `json:"author"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PoemID    uint      `gorm:"index;not null" json:"poem_id"`
	UserName  string    `gorm:"type:varchar(100);not null" json:"username"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Likes     uint      `gorm:"default:0;not null" json:"likes"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type CreateCommentInput struct {
	UserName string `json:"username" binding:"required"`
	Content  string `json:"content" binding:"required"`
}

type CreatePoemInput struct {
	Content    string `json:"content" binding:"required"`
	ContentJP  string `json:"content_jp"`
	ContentRO  string `json:"content_ro"`
	ContentEN  string `json:"content_en"`
	ContentPT  string `json:"content_pt"`
	AuthorName string `json:"author_name" binding:"required"`
}

func main() {
	// 1. Conecta ao Redis
	redisURL := getEnv("REDIS_URL", "redis://localhost:6379/0")
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Falha ao analisar a URL do Redis: %v", err)
	}
	opt.DialTimeout = 5 * time.Second
	opt.ReadTimeout = 3 * time.Second
	opt.WriteTimeout = 3 * time.Second
	opt.PoolSize = 50

	rdb := redis.NewClient(opt)

	// Testa a conexão Redis
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Falha ao conectar no Redis. O container está rodando? Erro: %v", err)
	}
	fmt.Println("✅ Conectado ao Redis com sucesso!")

	// 2. Conecta ao PostgreSQL (A Fonte da Verdade)
	dsn := getEnv("DATABASE_URL", "host=localhost user=admin password=password dbname=bleach_poems port=5432 sslmode=disable")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Falha ao conectar no PostgreSQL. O container está rodando? Erro: %v", err)
	}
	fmt.Println("✅ Conectado ao PostgreSQL com sucesso!")

	// Configura limites do Pool de Conexões do PostgreSQL
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Auto-Migração do GORM
	if err := db.AutoMigrate(&Author{}, &Poem{}, &Comment{}); err != nil {
		log.Fatalf("Falha na migração do banco: %v", err)
	}
	fmt.Println("📦 Tabelas do PostgreSQL migradas com sucesso!")

	// 3. Semeadura de Dados Iniciais no PostgreSQL (Fase 6)
	// Se o banco estiver vazio, semeamos no Postgres e enviamos os eventos para sincronizar no Redis
	var count int64
	db.Model(&Poem{}).Count(&count)
	if count == 0 {
		fmt.Println("🌱 Banco PostgreSQL vazio! Semeando poemas iniciais...")
		mocks := []struct {
			AuthorName string
			Content    string
			ContentJP  string
			ContentRO  string
			ContentEN  string
			ContentPT  string
		}{
			{
				"Rukia Kuchiki",
				"Tememos aquilo que não podemos ver",
				"我らは　姿無きが故に\nそれを畏れ",
				"warera wa sugatanaki ga yue ni\nsore o osore",
				"We fear\nwhat does not exist.",
				"Tememos aquilo que não podemos ver",
			},
			{
				"Rukia Kuchiki",
				"Toda vida é acompanhada pela expectativa da morte.",
				"人が人を爱するように\n人が人を憎むように",
				"hito ga hito o aisuru you ni\nhito ga hito o nikumu you ni",
				"Like people loving people\nLike people hating people",
				"Toda vida é acompanhada pela expectativa da morte.",
			},
			{"Ulquiorra Cifer", "A morte é a única conclusão verdadeira.", "", "", "", ""},
			{"Byakuya Kuchiki", "Você é lento até para cair.", "", "", "", ""},
			{"Sosuke Aizen", "Admirar é a emoção mais distante da compreensão.", "", "", "", ""},
			{"Shunsui Kyoraku", "Não busque a estética na batalha, busque a estética na morte.", "", "", "", ""},
			{"Ichigo Kurosaki", "Eu não estou lutando porque acho que vou vencer. Eu luto porque tenho que vencer.", "", "", "", ""},
		}

		for _, item := range mocks {
			var author Author
			db.Where("name = ?", item.AuthorName).FirstOrCreate(&author, Author{Name: item.AuthorName})

			poem := Poem{
				Content:   item.Content,
				ContentJP: item.ContentJP,
				ContentRO: item.ContentRO,
				ContentEN: item.ContentEN,
				ContentPT: item.ContentPT,
				AuthorID:  author.ID,
			}
			if err := db.Create(&poem).Error; err == nil {
				// Publica o evento para que o worker assíncrono popule o cache no Redis
				rdb.XAdd(ctx, &redis.XAddArgs{
					Stream: "poems:stream",
					Values: map[string]interface{}{
						"event":       "PoemCreated",
						"poem_id":     strconv.Itoa(int(poem.ID)),
						"content":     poem.Content,
						"author_name": author.Name,
						"content_jp":  poem.ContentJP,
						"content_ro":  poem.ContentRO,
						"content_en":  poem.ContentEN,
						"content_pt":  poem.ContentPT,
					},
				})
			}
		}
		fmt.Println("📦 Dados iniciais semeados e sincronização via streams agendada!")
	} else {
		fmt.Println("📦 Banco PostgreSQL já populado. Pulando semeadura.")
		
		// Auto-atualização de poemas existentes para multi-lang (Self-healing)
		var allDbPoems []Poem
		if err := db.Preload("Author").Find(&allDbPoems).Error; err == nil {
			for _, p := range allDbPoems {
				updated := false
				if p.Author.Name == "Rukia Kuchiki" && strings.Contains(p.Content, "Toda vida") && p.ContentJP == "" {
					p.ContentJP = "人が人を愛するように\n人が人を憎むように"
					p.ContentRO = "hito ga hito o aisuru you ni\nhito ga hito o nikumu you ni"
					p.ContentEN = "Like people loving people\nLike people hating people"
					p.ContentPT = "Toda vida é acompanhada pela expectativa da morte."
					db.Save(&p)
					updated = true
				}
				if p.Author.Name == "Rukia Kuchiki" && strings.Contains(p.Content, "Tememos") && p.ContentJP == "" {
					p.ContentJP = "我らは　姿無きが故に\nそれを畏れ"
					p.ContentRO = "warera wa sugatanaki ga yue ni\nsore o osore"
					p.ContentEN = "We fear\nwhat does not exist."
					p.ContentPT = "Tememos aquilo que não podemos ver"
					db.Save(&p)
					updated = true
				}
				if updated {
					fmt.Printf("⭐ Poema ID %d atualizado com multi-lang no Postgres!\n", p.ID)
				}
			}
		}
		
		// Semeia o Volume 1 (Rukia Kuchiki: We fear what does not exist) caso não exista na base
		var v1Count int64
		db.Model(&Poem{}).Where("id = ?", 1).Count(&v1Count)
		if v1Count == 0 {
			var author Author
			db.Where("name = ?", "Rukia Kuchiki").FirstOrCreate(&author, Author{Name: "Rukia Kuchiki"})
			p1 := Poem{
				Content:   "Tememos aquilo que não podemos ver",
				ContentJP: "我らは　姿無きが故に\nそれを畏れ",
				ContentRO: "warera wa sugatanaki ga yue ni\nsore o osore",
				ContentEN: "We fear\nwhat does not exist.",
				ContentPT: "Tememos aquilo que não podemos ver",
				AuthorID:  author.ID,
			}
			db.Create(&p1)
			fmt.Println("🌱 Semeado Volume 1 (Rukia) com multi-lang!")
		}
	}

	// Garante que todos os poemas existentes no Postgres estejam no cache do Redis (Retro-sincronização)
	var allPoems []Poem
	if err := db.Preload("Author").Find(&allPoems).Error; err == nil {
		fmt.Printf("🔄 Sincronizando %d poemas do Postgres para o cache do Redis...\n", len(allPoems))
		for _, p := range allPoems {
			poemKey := fmt.Sprintf("poem:%d", p.ID)
			slug := slugify(p.Content)
			rdb.HSet(ctx, poemKey, map[string]interface{}{
				"id":          strconv.Itoa(int(p.ID)),
				"content":     p.Content,
				"author_name": p.Author.Name,
				"content_jp":  p.ContentJP,
				"content_ro":  p.ContentRO,
				"content_en":  p.ContentEN,
				"content_pt":  p.ContentPT,
				"slug":        slug,
			})
			rdb.SAdd(ctx, "poems:available_ids", p.ID)
		}
	}

	// FASE 4: Inicializa o Hub SSE (Broker)
	broker := newSSEBroker()
	go broker.Start()

	// FASE 3/4: Inicializa o Worker em Background (Goroutine)
	go startEventWorker(rdb, broker)

	// 4. Inicializa o servidor HTTP (Gin)
	r := gin.Default()
	r.Use(corsMiddleware())
	r.Use(cacheControl())
	r.LoadHTMLGlob("templates/*")

	// ---- ROTA DE ESCRITA (Nova Fase 2) ----
	r.POST("/poem", adminAuth(), ipRateLimiter(5*time.Second), func(c *gin.Context) {
		var input CreatePoemInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido: " + err.Error()})
			return
		}

		// Sanitização de entradas contra XSS (Fase 7)
		input.Content = sanitize(input.Content)
		input.AuthorName = sanitize(input.AuthorName)
		input.ContentJP = sanitize(input.ContentJP)
		input.ContentRO = sanitize(input.ContentRO)
		input.ContentEN = sanitize(input.ContentEN)
		input.ContentPT = sanitize(input.ContentPT)

		if input.Content == "" || input.AuthorName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Conteúdo ou Autor inválidos após sanitização."})
			return
		}

		// Busca autor existente ou cria novo
		var author Author
		if err := db.Where("name = ?", input.AuthorName).FirstOrCreate(&author, Author{Name: input.AuthorName}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar autor no banco"})
			return
		}

		// Criação do Poema no "Write Model" (Postgres)
		poem := Poem{
			Content:   input.Content,
			ContentJP: input.ContentJP,
			ContentRO: input.ContentRO,
			ContentEN: input.ContentEN,
			ContentPT: input.ContentPT,
			AuthorID:  author.ID,
		}

		if err := db.Create(&poem).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar poema no banco"})
			return
		}

		// Preenche o autor para resposta JSON
		poem.Author = author

		// --- FASE 3: PUBLICANDO EVENTO DE CRIAÇÃO ---
		// O banco relacional fez o papel dele (gravou com segurança).
		// Agora avisamos o sistema que isso aconteceu enfileirando num stream.
		err := rdb.XAdd(ctx, &redis.XAddArgs{
			Stream: "poems:stream",
			Values: map[string]interface{}{
				"event":       "PoemCreated",
				"poem_id":     strconv.Itoa(int(poem.ID)),
				"content":     poem.Content,
				"author_name": author.Name,
				"content_jp":  poem.ContentJP,
				"content_ro":  poem.ContentRO,
				"content_en":  poem.ContentEN,
				"content_pt":  poem.ContentPT,
			},
		}).Err()
		
		if err != nil {
			log.Printf("Erro ao publicar evento: %v\n", err)
		} else {
			fmt.Println("📢 Evento PoemCreated enfileirado na Stream!")
		}

		c.JSON(http.StatusCreated, gin.H{
			"status": "Poema salvo na Fonte da Verdade (Postgres) e Evento Disparado!",
			"data":   poem,
		})
	})

	// ---- ROTA DE ENGAJAMENTO (Analytics / Fase 5) ----
	r.POST("/poem/:id/view", ipRateLimiter(1*time.Second), func(c *gin.Context) {
		poemID := c.Param("id")

		// APENAS Fila o evento. Não mexe em Postgres, nem calcula nada agora!
		err := rdb.XAdd(ctx, &redis.XAddArgs{
			Stream: "poems:stream",
			Values: map[string]interface{}{
				"event":   "PoemViewed",
				"poem_id": poemID,
			},
		}).Err()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao registrar view"})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{"message": "Engajamento registrado via evento assíncrono."})
	})

	// ---- ROTA DE RANKING (Fase 5) ----
	r.GET("/ranking", func(c *gin.Context) {
		// O Redis entrega o ranking mastigado em um milissegundo com ZRevRangeWithScores
		topPoems, err := rdb.ZRevRangeWithScores(ctx, "leaderboard:poems", 0, 4).Result()
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao carregar o ranking"})
			return
		}

		var ranking []map[string]interface{}
		for i, poem := range topPoems {
			poemID := poem.Member.(string)
			
			// Busca detalhes do poema no cache Redis Hash
			poemData, _ := rdb.HGetAll(ctx, fmt.Sprintf("poem:%s", poemID)).Result()
			
			content := "Poema desconhecido"
			authorName := "Sistema"
			
			if len(poemData) > 0 {
				content = poemData["content"]
				authorName = poemData["author_name"]
			} else {
				// Fallback para Postgres
				var dbPoem Poem
				if db.Preload("Author").First(&dbPoem, poemID).Error == nil {
					content = dbPoem.Content
					authorName = dbPoem.Author.Name
					// Sincroniza cache de volta
					slug := slugify(dbPoem.Content)
					rdb.HSet(ctx, fmt.Sprintf("poem:%s", poemID), map[string]interface{}{
						"id":          poemID,
						"content":     dbPoem.Content,
						"author_name": dbPoem.Author.Name,
						"slug":        slug,
					})
				}
			}

			ranking = append(ranking, map[string]interface{}{
				"posicao":     i + 1,
				"poem_id":     poemID,
				"views":       poem.Score,
				"content":     content,
				"author_name": authorName,
			})
		}

		c.JSON(http.StatusOK, gin.H{"top_5_lidos": ranking})
	})

	// ---- ROTA DE LEITURA (Originada na Fase 1) ----
	r.GET("/poem", func(c *gin.Context) {
		// Sorteia 1 ID aleatório do SET "poems:available_ids"
		poemID, err := rdb.SRandMember(ctx, "poems:available_ids").Result()
		if err == redis.Nil || poemID == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Nenhum poema encontrado no cache"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar poema no Redis"})
			return
		}

		// Busca o Hash do poema
		poemData, err := rdb.HGetAll(ctx, fmt.Sprintf("poem:%s", poemID)).Result()
		if err != nil || len(poemData) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Detalhes do poema não encontrados no cache"})
			return
		}

		formattedContent := fmt.Sprintf("%s - %s", poemData["content"], poemData["author_name"])

		c.JSON(http.StatusOK, gin.H{
			"source": "Redis (Read Model)",
			"poem":   formattedContent,
			"data":   poemData,
		})
	})

	// Rota para obter o Poema do Dia (determinístico por data)
	r.GET("/poem/day", func(c *gin.Context) {
		ids, err := rdb.SMembers(ctx, "poems:available_ids").Result()
		if err != nil || len(ids) == 0 {
			var dbPoems []Poem
			db.Find(&dbPoems)
			if len(dbPoems) == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Nenhum poema cadastrado"})
				return
			}
			dayOfYear := time.Now().YearDay()
			index := dayOfYear % len(dbPoems)
			poem := dbPoems[index]
			db.Model(&poem).Association("Author").Find(&poem.Author)
			formattedContent := fmt.Sprintf("%s - %s", poem.Content, poem.Author.Name)
			c.JSON(http.StatusOK, gin.H{
				"source": "PostgreSQL (Poem of the Day)",
				"poem":   formattedContent,
				"data":   poem,
			})
			return
		}

		var intIds []int
		for _, idStr := range ids {
			if val, err := strconv.Atoi(idStr); err == nil {
				intIds = append(intIds, val)
			}
		}
		// Ordenação
		for i := 0; i < len(intIds); i++ {
			for j := i + 1; j < len(intIds); j++ {
				if intIds[i] > intIds[j] {
					intIds[i], intIds[j] = intIds[j], intIds[i]
				}
			}
		}

		dayOfYear := time.Now().YearDay()
		index := dayOfYear % len(intIds)
		poemID := strconv.Itoa(intIds[index])

		poemData, err := rdb.HGetAll(ctx, fmt.Sprintf("poem:%s", poemID)).Result()
		if err != nil || len(poemData) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Detalhes do poema do dia não encontrados no cache"})
			return
		}

		formattedContent := fmt.Sprintf("%s - %s", poemData["content"], poemData["author_name"])

		c.JSON(http.StatusOK, gin.H{
			"source": "Redis (Poem of the Day)",
			"poem":   formattedContent,
			"data":   poemData,
		})
	})

	// API para retornar lista de IDs disponíveis (para uso do navbar no frontend)
	r.GET("/api/poems/ids", func(c *gin.Context) {
		ids, err := rdb.SMembers(ctx, "poems:available_ids").Result()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar IDs de poemas"})
			return
		}
		
		// Converte e ordena os IDs numericamete
		var intIds []int
		for _, idStr := range ids {
			if val, err := strconv.Atoi(idStr); err == nil {
				intIds = append(intIds, val)
			}
		}
		
		// Ordenação
		for i := 0; i < len(intIds); i++ {
			for j := i + 1; j < len(intIds); j++ {
				if intIds[i] > intIds[j] {
					intIds[i], intIds[j] = intIds[j], intIds[i]
				}
			}
		}
		
		c.JSON(http.StatusOK, gin.H{
			"ids": intIds,
		})
	})

	// API para retornar um poema específico por ID em formato JSON
	r.GET("/api/poem/:id", func(c *gin.Context) {
		poemID := c.Param("id")
		
		// 1. Busca no Cache Redis Hash
		poemKey := fmt.Sprintf("poem:%s", poemID)
		poemData, err := rdb.HGetAll(ctx, poemKey).Result()
		
		// Se não estiver no Redis, fazemos Self-Healing (lazy load do Postgres)
		if err != nil || len(poemData) == 0 {
			var poem Poem
			if err := db.Preload("Author").First(&poem, poemID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Poema não encontrado"})
				return
			}
			
			// Sincroniza no Cache
			slug := slugify(poem.Content)
			rdb.HSet(ctx, poemKey, map[string]interface{}{
				"id":          strconv.Itoa(int(poem.ID)),
				"content":     poem.Content,
				"author_name": poem.Author.Name,
				"slug":        slug,
			})
			rdb.SAdd(ctx, "poems:available_ids", poem.ID)
			
			poemData = map[string]string{
				"id":          strconv.Itoa(int(poem.ID)),
				"content":     poem.Content,
				"author_name": poem.Author.Name,
				"slug":        slug,
			}
		}
		
		c.JSON(http.StatusOK, gin.H{
			"source": "Redis (Read Model / API)",
			"data":   poemData,
		})
	})

	// ---- ENDPOINTS DE COMENTÁRIOS ----
	r.GET("/api/poem/:id/comments", func(c *gin.Context) {
		poemID := c.Param("id")
		cacheKey := fmt.Sprintf("comments:poem:%s", poemID)

		// Tenta obter do Redis
		cachedData, err := rdb.Get(ctx, cacheKey).Result()
		if err == nil && cachedData != "" {
			c.Header("Content-Type", "application/json")
			c.String(http.StatusOK, cachedData)
			return
		}

		// Busca no banco
		var comments []Comment
		if err := db.Where("poem_id = ?", poemID).Order("created_at asc").Find(&comments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar comentários"})
			return
		}

		// Converte para JSON e salva no Redis
		jsonData, err := json.Marshal(comments)
		if err == nil {
			rdb.Set(ctx, cacheKey, jsonData, 5*time.Minute)
		}

		c.JSON(http.StatusOK, comments)
	})

	r.POST("/api/poem/:id/comments", ipRateLimiter(15*time.Second), func(c *gin.Context) {
		var input CreateCommentInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido"})
			return
		}

		userName := sanitize(input.UserName)
		content := sanitize(input.Content)

		if userName == "" || content == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nome ou conteúdo inválido após sanitização"})
			return
		}

		poemIDVal, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de poema inválido"})
			return
		}

		comment := Comment{
			PoemID:   uint(poemIDVal),
			UserName: userName,
			Content:  content,
		}

		if err := db.Create(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar comentário"})
			return
		}

		// Invalida cache no Redis
		cacheKey := fmt.Sprintf("comments:poem:%s", c.Param("id"))
		rdb.Del(ctx, cacheKey)

		// Notifica via SSE
		broker.messages <- fmt.Sprintf("CommentCreated:%s", c.Param("id"))

		c.JSON(http.StatusCreated, comment)
	})

	r.GET("/api/comments/latest", adminAuth(), func(c *gin.Context) {
		var comments []Comment
		if err := db.Order("created_at desc").Limit(20).Find(&comments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar comentários recentes"})
			return
		}
		c.JSON(http.StatusOK, comments)
	})

	r.DELETE("/api/comment/:id", adminAuth(), func(c *gin.Context) {
		commentID := c.Param("id")
		var comment Comment
		if err := db.First(&comment, commentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comentário não encontrado"})
			return
		}

		if err := db.Delete(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir comentário"})
			return
		}

		// Invalida cache no Redis
		cacheKey := fmt.Sprintf("comments:poem:%d", comment.PoemID)
		rdb.Del(ctx, cacheKey)

		// Notifica via SSE
		broker.messages <- fmt.Sprintf("CommentCreated:%d", comment.PoemID)

		c.JSON(http.StatusOK, gin.H{"message": "Comentário excluído com sucesso"})
	})

	r.POST("/api/admin/verify", ipRateLimiter(5*time.Second), func(c *gin.Context) {
		type VerifyInput struct {
			Password string `json:"password" binding:"required"`
		}
		var input VerifyInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido"})
			return
		}

		adminPassword := getEnv("ADMIN_PASSWORD", "bankai")
		if input.Password != adminPassword {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "token": adminPassword})
	})

	r.POST("/api/comment/:id/like", ipRateLimiter(1*time.Second), func(c *gin.Context) {
		commentID := c.Param("id")
		var comment Comment
		if err := db.First(&comment, commentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comentário não encontrado"})
			return
		}

		comment.Likes++
		if err := db.Save(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao curtir comentário"})
			return
		}

		// Invalida cache no Redis
		cacheKey := fmt.Sprintf("comments:poem:%d", comment.PoemID)
		rdb.Del(ctx, cacheKey)

		// Notifica via SSE
		broker.messages <- fmt.Sprintf("CommentCreated:%d", comment.PoemID)

		c.JSON(http.StatusOK, comment)
	})

	// ---- ROTA SSR PARA SEO (Fase 6) ----
	poemSSRHandler := func(c *gin.Context) {
		poemID := c.Param("id")

		// 1. Busca no Cache Redis Hash
		poemKey := fmt.Sprintf("poem:%s", poemID)
		poemData, err := rdb.HGetAll(ctx, poemKey).Result()

		// Se não estiver no Redis, fazemos Self-Healing (lazy load do Postgres)
		if err != nil || len(poemData) == 0 {
			fmt.Printf("🔍 Cache miss para ID %s. Buscando no PostgreSQL...\n", poemID)

			var poem Poem
			if err := db.Preload("Author").First(&poem, poemID).Error; err != nil {
				c.HTML(http.StatusNotFound, "poem.html", gin.H{
					"ID":         poemID,
					"Content":    "Poema não encontrado.",
					"AuthorName": "Sistema",
				})
				return
			}

			// Sincroniza no Cache de forma síncrona para as próximas requisições (lazy load)
			slug := slugify(poem.Content)
			rdb.HSet(ctx, poemKey, map[string]interface{}{
				"id":          strconv.Itoa(int(poem.ID)),
				"content":     poem.Content,
				"author_name": poem.Author.Name,
				"slug":        slug,
			})
			rdb.SAdd(ctx, "poems:available_ids", poem.ID)

			// Preenche poemData para renderizar
			poemData = map[string]string{
				"id":          strconv.Itoa(int(poem.ID)),
				"content":     poem.Content,
				"author_name": poem.Author.Name,
				"slug":        slug,
			}
		}

		c.HTML(http.StatusOK, "poem.html", gin.H{
			"ID":         poemData["id"],
			"Content":    poemData["content"],
			"AuthorName": poemData["author_name"],
			"Slug":        poemData["slug"],
		})
	}

	r.GET("/poema/:id", poemSSRHandler)
	r.GET("/poem/:id", poemSSRHandler)

	// ---- ROTA DE TEMPO REAL SSE (FASE 4) ----
	r.GET("/poem/live", func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")

		// Cria um canal para este cliente específico
		clientChan := make(chan string)
		broker.newClients <- clientChan

		// Quando o cliente desconectar (fechar a aba), removemos do broker
		defer func() {
			broker.defunctClients <- clientChan
		}()

		c.Stream(func(w io.Writer) bool {
			// Aguarda mensagens do Broker
			if msg, ok := <-clientChan; ok {
				c.SSEvent("new_poem", msg)
				return true
			}
			return false
		})
	})

	// ---- FRONTEND SIMPLES (Para Testar a Fase 4) ----
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(`
			<!DOCTYPE html>
			<html lang="pt-BR">
			<head>
				<meta charset="UTF-8">
				<title>Placar Ao Vivo de Poemas</title>
				<style>
					body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fdfdfd; margin: 0; transition: background 0.5s; }
					.card { padding: 40px; border-radius: 10px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 600px; }
					.live-badge { color: red; font-weight: bold; font-size: 0.9em; margin-bottom: 10px; display: inline-block; animation: blink 1.5s infinite; }
					@keyframes blink { 50% { opacity: 0; } }
					h1 { margin: 0 0 20px 0; color: #333; }
					p#poem { font-size: 1.5em; font-style: italic; color: #444; }
				</style>
			</head>
			<body>
				<div class="card">
					<span class="live-badge">🔴 AO VIVO</span>
					<h1>Último Poema Cadastrado</h1>
					<p id="poem">Aguardando poeta...</p>
				</div>
				<script>
					const source = new EventSource('/poem/live');
					source.addEventListener('new_poem', function(e) {
						document.getElementById('poem').innerText = e.data;
						// Efeito visual quando chegar
						document.body.style.background = '#e6f7ff';
						setTimeout(() => document.body.style.background = '#fdfdfd', 500);
					});
				</script>
			</body>
			</html>
		`))
	})

	// Rota de Healthcheck
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	fmt.Println("🚀 Servidor rodando na porta 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}