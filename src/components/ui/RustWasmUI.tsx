import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RustPythonUI() {
  const [number, setNumber] = useState(5)
  const [list, setList] = useState("1.0, 2.0, 3.0")
  const [factorialResult, setFactorialResult] = useState(null)
  const [sumResult, setSumResult] = useState(null)
  const [wasm, setWasm] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock WASM module for demonstration
  const mockWasmModule = {
    factorial: (n) => {
      if (n < 0) throw new Error("Il fattoriale non è definito per numeri negativi")
      if (n > 20) throw new Error("Numero troppo grande per il calcolo del fattoriale")
      let result = 1
      for (let i = 2; i <= n; i++) {
        result *= i
      }
      return result
    },
    sum_list: (array) => {
      if (!array || array.length === 0) throw new Error("Array vuoto o non valido")
      return Array.from(array).reduce((sum, val) => {
        if (isNaN(val)) throw new Error("Valore non numerico nell'array")
        return sum + val
      }, 0)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulazione del caricamento del modulo WASM
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In un ambiente reale, qui caricheresti il vero modulo WASM
        // const wasmModule = await import("../wasm/rust_wasm_module.js")
        
        // Per ora usiamo il mock
        setWasm(mockWasmModule)
        setLoading(false)
      } catch (err) {
        console.error("Errore nel caricamento del modulo WASM:", err)
        setError("Errore nel caricamento del modulo WebAssembly")
        setLoading(false)
      }
    })()
  }, [])

  const callRustFunctions = async () => {
    if (!wasm) return
    
    setError(null)
    setFactorialResult(null)
    setSumResult(null)

    try {
      // Validazione input numero
      const n = parseInt(number)
      if (isNaN(n)) {
        throw new Error("Il numero per il fattoriale deve essere un intero valido")
      }

      // Validazione input lista
      const listStr = list.trim()
      if (!listStr) {
        throw new Error("La lista non può essere vuota")
      }

      const values = listStr.split(",").map(v => {
        const parsed = parseFloat(v.trim())
        if (isNaN(parsed)) {
          throw new Error(`Valore non valido nella lista: "${v.trim()}"`)
        }
        return parsed
      })

      if (values.length === 0) {
        throw new Error("La lista deve contenere almeno un valore")
      }

      // Esecuzione funzioni
      const fact = wasm.factorial(n)
      const sum = wasm.sum_list(new Float64Array(values))
      
      setFactorialResult(fact)
      setSumResult(sum)

    } catch (err) {
      console.error("Errore durante l'esecuzione delle funzioni Rust:", err)
      setError(err.message)
    }
  }

  const handleNumberChange = (e) => {
    setNumber(e.target.value)
    // Reset risultati quando cambia l'input
    setFactorialResult(null)
    setError(null)
  }

  const handleListChange = (e) => {
    setList(e.target.value)
    // Reset risultati quando cambia l'input
    setSumResult(null)
    setError(null)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rust + WebAssembly Integration UI
            </h2>
            <p className="text-gray-600 text-sm">
              Interfaccia per testare funzioni Rust compilate in WebAssembly
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Numero per fattoriale:
              </label>
              <Input 
                type="number" 
                value={number} 
                onChange={handleNumberChange}
                placeholder="Inserisci un numero intero"
                min="0"
                max="20"
              />
              <p className="text-xs text-gray-500">
                Calcola il fattoriale (0-20)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Lista di numeri (per somma):
              </label>
              <Input 
                value={list} 
                onChange={handleListChange}
                placeholder="1.0, 2.0, 3.0"
              />
              <p className="text-xs text-gray-500">
                Numeri separati da virgola
              </p>
            </div>

            <Button 
              onClick={callRustFunctions} 
              disabled={loading || !wasm}
              className="w-full"
            >
              {loading ? "Caricamento WASM..." : 
               !wasm ? "Modulo non disponibile" : 
               "Esegui funzioni Rust"}
            </Button>
          </div>

          {/* Risultati */}
          <div className="space-y-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  <span className="font-medium">Errore:</span> {error}
                </p>
              </div>
            )}

            {factorialResult !== null && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  <span className="font-medium">Fattoriale di {number}:</span> {factorialResult.toLocaleString()}
                </p>
              </div>
            )}

            {sumResult !== null && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800">
                  <span className="font-medium">Somma della lista:</span> {sumResult}
                </p>
              </div>
            )}
          </div>

          {/* Status info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {loading ? "⏳ Caricamento modulo WebAssembly..." :
               wasm ? "✅ Modulo WebAssembly caricato (mock)" :
               "❌ Modulo WebAssembly non disponibile"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
