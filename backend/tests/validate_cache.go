package main

import (
	"fmt"
	"net/http"
	"strings"
)

const baseURL = "http://localhost:8080"

func main() {
	fmt.Println("🚀 Iniciando Teste de Validação de Cache HTTP (Fase 8)...")

	// 0. Verifica se o servidor está rodando
	resp, err := http.Get(baseURL + "/ping")
	if err != nil {
		fmt.Printf("❌ ERRO: O servidor não está rodando no %s. Por favor, inicie a API com 'go run main.go' antes de rodar os testes.\n", baseURL)
		return
	}
	resp.Body.Close()
	fmt.Println("✅ Conectado ao servidor com sucesso!")

	// 1. Validar Cache-Control na Landing Page (/)
	validateRouteCache("/", "public, max-age=300")

	// 2. Validar Cache-Control na API de Poema (/poem)
	validateRouteCache("/poem", "no-store, no-cache, must-revalidate, proxy-revalidate")

	// 3. Validar Cache-Control na Rota SSR (/poema/1)
	validateRouteCache("/poema/1", "no-store, no-cache, must-revalidate, proxy-revalidate")

	// 4. Validar Cache-Control na Rota SSR alternativa (/poem/1)
	validateRouteCache("/poem/1", "no-store, no-cache, must-revalidate, proxy-revalidate")

	// 5. Validar Cache-Control no Ranking (/ranking)
	validateRouteCache("/ranking", "no-store, no-cache, must-revalidate, proxy-revalidate")

	fmt.Println("\n🏁 Testes de Cache finalizados!")
}

func validateRouteCache(route string, expectedHeader string) {
	fmt.Printf("\n🧪 Testando cabeçalhos de cache para rota: %s...\n", route)

	resp, err := http.Head(baseURL + route)
	if err != nil {
		fmt.Printf("   ❌ Falha ao fazer requisição HEAD: %v\n", err)
		return
	}
	resp.Body.Close()

	cacheHeader := resp.Header.Get("Cache-Control")
	pragmaHeader := resp.Header.Get("Pragma")
	expiresHeader := resp.Header.Get("Expires")

	// Validação básica do Cache-Control
	if cacheHeader == expectedHeader {
		fmt.Printf("   ✅ [PASS] Cache-Control está correto: \"%s\"\n", cacheHeader)
	} else {
		fmt.Printf("   ❌ [FAIL] Cache-Control incorreto. Esperado: \"%s\", Recebido: \"%s\"\n", expectedHeader, cacheHeader)
	}

	// Validação adicional de no-cache para APIs/SSR
	if strings.Contains(expectedHeader, "no-store") {
		if pragmaHeader == "no-cache" && expiresHeader == "0" {
			fmt.Println("   ✅ [PASS] Cabeçalhos Pragma e Expires extras de prevenção de cache estão corretos!")
		} else {
			fmt.Printf("   ⚠️ [WARNING] Cabeçalhos adicionais ausentes ou incorretos (Pragma: \"%s\", Expires: \"%s\")\n", pragmaHeader, expiresHeader)
		}
	}
}
