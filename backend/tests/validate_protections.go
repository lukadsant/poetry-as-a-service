package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const baseURL = "http://localhost:8080"

func main() {
	fmt.Println("🚀 Iniciando Teste de Validação das Proteções (Fase 7)...")

	// 0. Verifica se o servidor está rodando
	resp, err := http.Get(baseURL + "/ping")
	if err != nil {
		fmt.Printf("❌ ERRO: O servidor não parece estar rodando no %s. Por favor, inicie a API com 'go run main.go' em outro terminal antes de rodar os testes.\n", baseURL)
		return
	}
	resp.Body.Close()
	fmt.Println("✅ Conectado ao servidor com sucesso!")

	// 1. Executa Teste de Sanitização contra XSS
	testSanitization()

	// Aguarda um momento para limpar limites de IP das rotas de cadastro
	time.Sleep(5 * time.Second)

	// 2. Executa Teste de Rate Limiting na Rota de Visualização
	testRateLimitingView()

	// 3. Executa Teste de Rate Limiting na Rota de Criação
	testRateLimitingCreate()

	fmt.Println("\n🏁 Testes finalizados!")
}

func testSanitization() {
	fmt.Println("\n🧪 Teste 1: Sanitização contra XSS (POST /poem)...")

	payload := map[string]string{
		"author_name": "TestBot <script>evil()</script><b>Bold</b>",
		"content":     "Meu poema limpo <iframe src='hacker.com'></iframe>fim",
	}
	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post(baseURL+"/poem", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("   ❌ Falha ao fazer request: %v\n", err)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyStr := string(bodyBytes)

	if resp.StatusCode != http.StatusCreated {
		fmt.Printf("   ❌ Status inesperado: %d. Resposta: %s\n", resp.StatusCode, bodyStr)
		return
	}

	// Verifica se as tags HTML foram removidas no JSON retornado
	if strings.Contains(bodyStr, "<script>") || strings.Contains(bodyStr, "<iframe>") || strings.Contains(bodyStr, "<b>") {
		fmt.Printf("   ❌ [FAIL] Tags HTML indesejadas ainda estão presentes na resposta!\n   Conteúdo retornado: %s\n", bodyStr)
	} else if strings.Contains(bodyStr, "TestBot evil()Bold") && strings.Contains(bodyStr, "Meu poema limpo fim") {
		fmt.Println("   ✅ [PASS] Tags HTML removidas com sucesso!")
		fmt.Printf("   Saída Limpa: %s\n", bodyStr)
	} else {
		fmt.Printf("   ⚠️ [WARNING] A resposta não contém as strings esperadas, revise a saída: %s\n", bodyStr)
	}
}

func testRateLimitingView() {
	fmt.Println("\n🧪 Teste 2: Rate Limiting na Visualização (POST /poem/:id/view)...")
	fmt.Println("   Disparando 3 requisições rápidas seguidas...")

	successCount := 0
	blockedCount := 0

	for i := 1; i <= 3; i++ {
		resp, err := http.Post(baseURL+"/poem/1/view", "application/json", nil)
		if err != nil {
			fmt.Printf("   ❌ Falha no request %d: %v\n", i, err)
			continue
		}
		
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			blockedCount++
			fmt.Printf("   🔒 Request %d: Bloqueado (HTTP 429 - Too Many Requests). Resposta: %s\n", i, strings.TrimSpace(string(bodyBytes)))
		} else if resp.StatusCode == http.StatusAccepted || resp.StatusCode == http.StatusOK {
			successCount++
			fmt.Printf("   ✅ Request %d: Permitido (HTTP %d)\n", i, resp.StatusCode)
		} else {
			fmt.Printf("   ⚠️ Request %d: Status inesperado %d\n", i, resp.StatusCode)
		}
		// Sem sleep para testar a concorrência rápida
	}

	if blockedCount > 0 {
		fmt.Printf("   ✅ [PASS] Rate Limiting bloqueou requisições rápidas de visualização. (Permitidos: %d, Bloqueados: %d)\n", successCount, blockedCount)
	} else {
		fmt.Println("   ❌ [FAIL] Rate Limiting de visualizações falhou. Todos os requests rápidos foram permitidos.")
	}
}

func testRateLimitingCreate() {
	fmt.Println("\n🧪 Teste 3: Rate Limiting na Criação (POST /poem)...")
	fmt.Println("   Disparando 2 requisições rápidas seguidas de cadastro...")

	payload := map[string]string{
		"author_name": "LimitBot",
		"content":     "Poema de teste de limite",
	}
	jsonData, _ := json.Marshal(payload)

	successCount := 0
	blockedCount := 0

	for i := 1; i <= 2; i++ {
		resp, err := http.Post(baseURL+"/poem", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			fmt.Printf("   ❌ Falha no request %d: %v\n", i, err)
			continue
		}
		
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			blockedCount++
			fmt.Printf("   🔒 Cadastro %d: Bloqueado (HTTP 429). Resposta: %s\n", i, strings.TrimSpace(string(bodyBytes)))
		} else if resp.StatusCode == http.StatusCreated {
			successCount++
			fmt.Printf("   ✅ Cadastro %d: Sucesso (HTTP 201)\n", i)
		} else {
			fmt.Printf("   ⚠️ Cadastro %d: Status inesperado %d\n", i, resp.StatusCode)
		}
	}

	if blockedCount > 0 {
		fmt.Printf("   ✅ [PASS] Rate Limiting bloqueou cadastros rápidos. (Permitidos: %d, Bloqueados: %d)\n", successCount, blockedCount)
	} else {
		fmt.Println("   ❌ [FAIL] Rate Limiting de cadastros falhou. Todos os requests rápidos foram permitidos.")
	}
}
