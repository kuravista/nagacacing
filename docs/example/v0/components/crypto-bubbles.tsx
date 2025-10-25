"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Settings, Menu, Pencil, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StockData {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  volume24h: number
  hourChange: number
  dayChange: number
  weekChange: number
  monthChange: number
  yearChange: number
  icon: string
}

const mockStockData: StockData[] = [
  {
    id: 1,
    name: "Bank Central Asia",
    symbol: "BBCA",
    price: 10250,
    marketCap: 1.26e15,
    volume24h: 2.5e12,
    hourChange: -0.2,
    dayChange: 1.5,
    weekChange: 2.3,
    monthChange: 5.8,
    yearChange: 18.5,
  },
  {
    id: 2,
    name: "Bank Rakyat Indonesia",
    symbol: "BBRI",
    price: 5175,
    marketCap: 7.8e14,
    volume24h: 3.2e12,
    hourChange: 0.3,
    dayChange: 2.1,
    weekChange: 3.5,
    monthChange: 7.2,
    yearChange: 22.3,
  },
  {
    id: 3,
    name: "Bank Mandiri",
    symbol: "BMRI",
    price: 6800,
    marketCap: 6.5e14,
    volume24h: 2.8e12,
    hourChange: -0.1,
    dayChange: 1.8,
    weekChange: 2.9,
    monthChange: 6.5,
    yearChange: 19.7,
  },
  {
    id: 4,
    name: "Telkom Indonesia",
    symbol: "TLKM",
    price: 3890,
    marketCap: 3.8e14,
    volume24h: 1.5e12,
    hourChange: 0.5,
    dayChange: -0.8,
    weekChange: 1.2,
    monthChange: 3.4,
    yearChange: 12.8,
  },
  {
    id: 5,
    name: "Astra International",
    symbol: "ASII",
    price: 5450,
    marketCap: 3.2e14,
    volume24h: 1.8e12,
    hourChange: -0.3,
    dayChange: 1.2,
    weekChange: -1.5,
    monthChange: 2.8,
    yearChange: 15.6,
  },
  {
    id: 6,
    name: "Unilever Indonesia",
    symbol: "UNVR",
    price: 2680,
    marketCap: 2.1e14,
    volume24h: 8.5e11,
    hourChange: 0.2,
    dayChange: 0.5,
    weekChange: 1.8,
    monthChange: 4.2,
    yearChange: 8.9,
  },
  {
    id: 7,
    name: "GoTo Gojek Tokopedia",
    symbol: "GOTO",
    price: 68,
    marketCap: 1.8e14,
    volume24h: 5.2e12,
    hourChange: -1.2,
    dayChange: -3.5,
    weekChange: -8.2,
    monthChange: -15.6,
    yearChange: -42.3,
  },
  {
    id: 8,
    name: "Amman Mineral",
    symbol: "AMMN",
    price: 9875,
    marketCap: 1.5e14,
    volume24h: 2.1e12,
    hourChange: 1.8,
    dayChange: 4.2,
    weekChange: 8.5,
    monthChange: 12.3,
    yearChange: 45.7,
  },
  {
    id: 9,
    name: "Indofood Sukses Makmur",
    symbol: "INDF",
    price: 6725,
    marketCap: 5.9e13,
    volume24h: 7.8e11,
    hourChange: 0.1,
    dayChange: 0.8,
    weekChange: 2.1,
    monthChange: 5.6,
    yearChange: 11.2,
  },
  {
    id: 10,
    name: "Indofood CBP",
    symbol: "ICBP",
    price: 11200,
    marketCap: 5.5e13,
    volume24h: 6.2e11,
    hourChange: -0.2,
    dayChange: 1.1,
    weekChange: 2.8,
    monthChange: 6.3,
    yearChange: 13.5,
  },
  {
    id: 11,
    name: "Kalbe Farma",
    symbol: "KLBF",
    price: 1545,
    marketCap: 4.8e13,
    volume24h: 9.5e11,
    hourChange: 0.3,
    dayChange: 1.5,
    weekChange: 3.2,
    monthChange: 7.8,
    yearChange: 16.4,
  },
  {
    id: 12,
    name: "Adaro Energy",
    symbol: "ADRO",
    price: 3280,
    marketCap: 4.2e13,
    volume24h: 1.2e12,
    hourChange: -0.8,
    dayChange: -2.1,
    weekChange: -3.5,
    monthChange: -8.9,
    yearChange: 25.6,
  },
  {
    id: 13,
    name: "Bukit Asam",
    symbol: "PTBA",
    price: 2890,
    marketCap: 3.8e13,
    volume24h: 8.9e11,
    hourChange: -0.5,
    dayChange: -1.8,
    weekChange: -4.2,
    monthChange: -9.5,
    yearChange: 18.9,
  },
  {
    id: 14,
    name: "Indo Tambangraya",
    symbol: "ITMG",
    price: 28500,
    marketCap: 3.5e13,
    volume24h: 4.5e11,
    hourChange: -0.9,
    dayChange: -2.5,
    weekChange: -5.1,
    monthChange: -11.2,
    yearChange: 22.3,
  },
  {
    id: 15,
    name: "Aneka Tambang",
    symbol: "ANTM",
    price: 1685,
    marketCap: 3.2e13,
    volume24h: 1.5e12,
    hourChange: 0.6,
    dayChange: 2.3,
    weekChange: 4.8,
    monthChange: 8.5,
    yearChange: 32.1,
  },
  {
    id: 16,
    name: "Vale Indonesia",
    symbol: "INCO",
    price: 4950,
    marketCap: 2.9e13,
    volume24h: 6.8e11,
    hourChange: 0.8,
    dayChange: 2.8,
    weekChange: 5.6,
    monthChange: 9.8,
    yearChange: 28.4,
  },
  {
    id: 17,
    name: "Semen Indonesia",
    symbol: "SMGR",
    price: 5825,
    marketCap: 2.7e13,
    volume24h: 5.2e11,
    hourChange: -0.3,
    dayChange: 0.5,
    weekChange: 1.8,
    monthChange: 3.9,
    yearChange: 9.7,
  },
  {
    id: 18,
    name: "Gudang Garam",
    symbol: "GGRM",
    price: 24750,
    marketCap: 2.5e13,
    volume24h: 3.8e11,
    hourChange: 0.2,
    dayChange: 0.9,
    weekChange: 2.3,
    monthChange: 5.1,
    yearChange: 12.8,
  },
  {
    id: 19,
    name: "HM Sampoerna",
    symbol: "HMSP",
    price: 1285,
    marketCap: 2.3e13,
    volume24h: 4.5e11,
    hourChange: -0.1,
    dayChange: 0.3,
    weekChange: 1.1,
    monthChange: 2.8,
    yearChange: 7.5,
  },
  {
    id: 20,
    name: "XL Axiata",
    symbol: "EXCL",
    price: 2450,
    marketCap: 2.1e13,
    volume24h: 6.8e11,
    hourChange: 0.4,
    dayChange: 1.6,
    weekChange: 3.5,
    monthChange: 7.2,
    yearChange: 15.8,
  },
  {
    id: 21,
    name: "Sarana Menara Nusantara",
    symbol: "TOWR",
    price: 685,
    marketCap: 1.9e13,
    volume24h: 8.2e11,
    hourChange: 0.7,
    dayChange: 2.1,
    weekChange: 4.5,
    monthChange: 8.9,
    yearChange: 18.6,
  },
  {
    id: 22,
    name: "Charoen Pokphand",
    symbol: "CPIN",
    price: 4850,
    marketCap: 1.8e13,
    volume24h: 5.5e11,
    hourChange: -0.4,
    dayChange: 1.2,
    weekChange: 2.8,
    monthChange: 6.5,
    yearChange: 14.2,
  },
  {
    id: 23,
    name: "Japfa Comfeed",
    symbol: "JPFA",
    price: 1420,
    marketCap: 1.6e13,
    volume24h: 4.2e11,
    hourChange: 0.5,
    dayChange: 1.8,
    weekChange: 3.6,
    monthChange: 7.8,
    yearChange: 16.9,
  },
  {
    id: 24,
    name: "Merdeka Copper Gold",
    symbol: "MDKA",
    price: 2180,
    marketCap: 1.5e13,
    volume24h: 7.8e11,
    hourChange: 1.2,
    dayChange: 3.5,
    weekChange: 6.8,
    monthChange: 11.2,
    yearChange: 38.5,
  },
  {
    id: 25,
    name: "Barito Pacific",
    symbol: "BRPT",
    price: 1095,
    marketCap: 1.4e13,
    volume24h: 5.8e11,
    hourChange: -0.6,
    dayChange: -1.5,
    weekChange: -2.8,
    monthChange: -6.5,
    yearChange: 12.3,
  },
  {
    id: 26,
    name: "Chandra Asri Pacific",
    symbol: "TPIA",
    price: 3650,
    marketCap: 1.3e13,
    volume24h: 4.5e11,
    hourChange: -0.8,
    dayChange: -2.1,
    weekChange: -4.5,
    monthChange: -8.9,
    yearChange: 15.6,
  },
  {
    id: 27,
    name: "United Tractors",
    symbol: "UNTR",
    price: 28900,
    marketCap: 1.2e13,
    volume24h: 3.2e11,
    hourChange: -0.3,
    dayChange: 0.8,
    weekChange: 2.1,
    monthChange: 4.8,
    yearChange: 19.2,
  },
  {
    id: 28,
    name: "Ace Hardware",
    symbol: "ACES",
    price: 825,
    marketCap: 1.1e13,
    volume24h: 6.5e11,
    hourChange: 0.9,
    dayChange: 2.5,
    weekChange: 5.2,
    monthChange: 9.8,
    yearChange: 21.5,
  },
  {
    id: 29,
    name: "Matahari Department Store",
    symbol: "LPPF",
    price: 6450,
    marketCap: 1.0e13,
    volume24h: 2.8e11,
    hourChange: 0.6,
    dayChange: 1.9,
    weekChange: 4.1,
    monthChange: 8.5,
    yearChange: 17.8,
  },
  {
    id: 30,
    name: "Sumber Alfaria Trijaya",
    symbol: "AMRT",
    price: 2890,
    marketCap: 9.5e12,
    volume24h: 5.2e11,
    hourChange: 0.3,
    dayChange: 1.2,
    weekChange: 2.8,
    monthChange: 6.5,
    yearChange: 14.8,
  },
  {
    id: 31,
    name: "Mayora Indah",
    symbol: "MYOR",
    price: 2650,
    marketCap: 8.8e12,
    volume24h: 3.8e11,
    hourChange: -0.2,
    dayChange: 0.8,
    weekChange: 2.1,
    monthChange: 5.2,
    yearChange: 11.5,
  },
  {
    id: 32,
    name: "Pakuwon Jati",
    symbol: "PWON",
    price: 485,
    marketCap: 8.2e12,
    volume24h: 4.5e11,
    hourChange: 0.8,
    dayChange: 2.3,
    weekChange: 4.8,
    monthChange: 9.2,
    yearChange: 18.9,
  },
  {
    id: 33,
    name: "Bumi Serpong Damai",
    symbol: "BSDE",
    price: 1125,
    marketCap: 7.8e12,
    volume24h: 6.2e11,
    hourChange: 1.1,
    dayChange: 2.8,
    weekChange: 5.5,
    monthChange: 10.2,
    yearChange: 22.3,
  },
  {
    id: 34,
    name: "Summarecon Agung",
    symbol: "SMRA",
    price: 895,
    marketCap: 7.2e12,
    volume24h: 5.8e11,
    hourChange: 0.9,
    dayChange: 2.5,
    weekChange: 5.1,
    monthChange: 9.8,
    yearChange: 20.5,
  },
  {
    id: 35,
    name: "Lippo Karawaci",
    symbol: "LPKR",
    price: 268,
    marketCap: 6.8e12,
    volume24h: 7.5e11,
    hourChange: 1.5,
    dayChange: 3.8,
    weekChange: 7.2,
    monthChange: 12.5,
    yearChange: 28.9,
  },
  {
    id: 36,
    name: "Wijaya Karya",
    symbol: "WIKA",
    price: 1485,
    marketCap: 6.5e12,
    volume24h: 4.2e11,
    hourChange: -0.5,
    dayChange: 0.8,
    weekChange: 2.3,
    monthChange: 5.8,
    yearChange: 13.2,
  },
  {
    id: 37,
    name: "Adhi Karya",
    symbol: "ADHI",
    price: 1125,
    marketCap: 6.2e12,
    volume24h: 3.8e11,
    hourChange: -0.3,
    dayChange: 1.1,
    weekChange: 2.8,
    monthChange: 6.2,
    yearChange: 14.5,
  },
  {
    id: 38,
    name: "Waskita Karya",
    symbol: "WSKT",
    price: 185,
    marketCap: 5.8e12,
    volume24h: 5.2e11,
    hourChange: 0.5,
    dayChange: 1.6,
    weekChange: 3.5,
    monthChange: 7.8,
    yearChange: 16.8,
  },
  {
    id: 39,
    name: "PP Properti",
    symbol: "PPRO",
    price: 268,
    marketCap: 5.5e12,
    volume24h: 4.5e11,
    hourChange: 1.2,
    dayChange: 3.1,
    weekChange: 6.5,
    monthChange: 11.8,
    yearChange: 24.5,
  },
  {
    id: 40,
    name: "Bukalapak",
    symbol: "BUKA",
    price: 68,
    marketCap: 5.2e12,
    volume24h: 8.5e11,
    hourChange: -1.8,
    dayChange: -4.5,
    weekChange: -9.2,
    monthChange: -18.5,
    yearChange: -52.3,
  },
]

export default function CryptoBubbles() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState<"hour" | "day" | "week" | "month" | "year">("day")
  const [limit, setLimit] = useState("100")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bubbles, setBubbles] = useState<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = window.innerWidth < 768 ? 400 : 600
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    const newBubbles = mockStockData.map((stock) => {
      const changeValue = {
        hour: stock.hourChange,
        day: stock.dayChange,
        week: stock.weekChange,
        month: stock.monthChange,
        year: stock.yearChange,
      }[timePeriod]

      const maxMarketCap = Math.max(...mockStockData.map((s) => s.marketCap))
      const minMarketCap = Math.min(...mockStockData.map((s) => s.marketCap))
      const normalizedCap = (stock.marketCap - minMarketCap) / (maxMarketCap - minMarketCap)

      const exponentialFactor = Math.pow(normalizedCap, 0.8)

      const isMobile = window.innerWidth < 768
      const sizeMultiplier = isMobile ? 0.7 : 1
      const size = (25 + exponentialFactor * 155) * sizeMultiplier

      return {
        ...stock,
        x: Math.random() * (canvas.width - size * 2) + size,
        y: Math.random() * (canvas.height - size * 2) + size,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size,
        change: changeValue,
      }
    })

    setBubbles(newBubbles)

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      newBubbles.forEach((bubble, i) => {
        bubble.x += bubble.vx
        bubble.y += bubble.vy

        if (bubble.x - bubble.size < 0 || bubble.x + bubble.size > canvas.width) {
          bubble.vx *= -0.8
          bubble.x = Math.max(bubble.size, Math.min(canvas.width - bubble.size, bubble.x))
        }
        if (bubble.y - bubble.size < 0 || bubble.y + bubble.size > canvas.height) {
          bubble.vy *= -0.8
          bubble.y = Math.max(bubble.size, Math.min(canvas.height - bubble.size, bubble.y))
        }

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const toCenterX = (centerX - bubble.x) * 0.0001
        const toCenterY = (centerY - bubble.y) * 0.0001
        bubble.vx += toCenterX
        bubble.vy += toCenterY

        const maxVelocity = 2
        const velocity = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy)
        if (velocity > maxVelocity) {
          bubble.vx = (bubble.vx / velocity) * maxVelocity
          bubble.vy = (bubble.vy / velocity) * maxVelocity
        }

        for (let j = i + 1; j < newBubbles.length; j++) {
          const other = newBubbles[j]
          const dx = other.x - bubble.x
          const dy = other.y - bubble.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDist = bubble.size + other.size

          if (distance < minDist) {
            const angle = Math.atan2(dy, dx)
            const targetX = bubble.x + Math.cos(angle) * minDist
            const targetY = bubble.y + Math.sin(angle) * minDist
            const ax = (targetX - other.x) * 0.03
            const ay = (targetY - other.y) * 0.03

            bubble.vx -= ax
            bubble.vy -= ay
            other.vx += ax
            other.vy += ay
          }
        }

        let color: string
        if (bubble.change > 10) {
          color = "#00ff88"
        } else if (bubble.change > 5) {
          color = "#10b981"
        } else if (bubble.change > 0) {
          color = "#22c55e"
        } else if (bubble.change > -5) {
          color = "#ff4444"
        } else if (bubble.change > -10) {
          color = "#ef4444"
        } else {
          color = "#dc2626"
        }

        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${Math.max(10, bubble.size / 4)}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(bubble.symbol, bubble.x, bubble.y - bubble.size / 8)

        ctx.font = `${Math.max(9, bubble.size / 5)}px sans-serif`
        ctx.fillText(
          `${bubble.change > 0 ? "+" : ""}${bubble.change.toFixed(1)}%`,
          bubble.x,
          bubble.y + bubble.size / 8,
        )
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [timePeriod])

  const formatNumber = (num: number) => {
    if (num >= 1e15) return `Rp${(num / 1e15).toFixed(2)}Q`
    if (num >= 1e12) return `Rp${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `Rp${(num / 1e9).toFixed(2)}M`
    return `Rp${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString()}`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500"
    if (change < 0) return "text-red-500"
    return "text-gray-400"
  }

  const filteredData = mockStockData.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#2a2a2a]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 md:px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-400 rounded-full" />
              </div>
              <h1 className="text-base md:text-xl font-bold">IHSG BUBBLES</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 w-full md:w-auto md:max-w-md md:mx-8 order-3 md:order-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari saham..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 order-2 md:order-3">
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-24 md:w-32 bg-[#1a1a1a] border-gray-700 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">1 - 100</SelectItem>
                <SelectItem value="200">1 - 200</SelectItem>
                <SelectItem value="500">1 - 500</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="text-white h-8 w-8 md:h-10 md:w-10">
              <Menu className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white h-8 w-8 md:h-10 md:w-10">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>

        {/* Time period filters */}
        <div className="flex items-center gap-2 px-3 md:px-4 pb-3 overflow-x-auto">
          <Button
            variant={timePeriod === "hour" ? "default" : "outline"}
            onClick={() => setTimePeriod("hour")}
            className={`text-sm whitespace-nowrap ${
              timePeriod === "hour"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-transparent border-gray-700 text-white hover:bg-gray-800"
            }`}
          >
            Jam
          </Button>
          <Button
            variant={timePeriod === "day" ? "default" : "outline"}
            onClick={() => setTimePeriod("day")}
            className={`text-sm whitespace-nowrap ${
              timePeriod === "day"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-transparent border-gray-700 text-white hover:bg-gray-800"
            }`}
          >
            Hari
          </Button>
          <Button
            variant={timePeriod === "week" ? "default" : "outline"}
            onClick={() => setTimePeriod("week")}
            className={`text-sm whitespace-nowrap ${
              timePeriod === "week"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-transparent border-gray-700 text-white hover:bg-gray-800"
            }`}
          >
            Minggu
          </Button>
          <Button
            variant={timePeriod === "month" ? "default" : "outline"}
            onClick={() => setTimePeriod("month")}
            className={`text-sm whitespace-nowrap ${
              timePeriod === "month"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-transparent border-gray-700 text-white hover:bg-gray-800"
            }`}
          >
            Bulan
          </Button>
          <Button
            variant={timePeriod === "year" ? "default" : "outline"}
            onClick={() => setTimePeriod("year")}
            className={`text-sm whitespace-nowrap ${
              timePeriod === "year"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-transparent border-gray-700 text-white hover:bg-gray-800"
            }`}
          >
            Tahun
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-gray-700 text-white hover:bg-gray-800 text-sm whitespace-nowrap hidden md:inline-flex"
          >
            Market Cap & Hari
          </Button>
          <Button variant="ghost" size="icon" className="text-white h-8 w-8 md:h-10 md:w-10 hidden md:inline-flex">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white h-8 w-8 md:h-10 md:w-10 hidden md:inline-flex">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Tabs defaultValue="bubbles" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-gray-800 bg-[#2a2a2a] h-10 md:h-12 px-3 md:px-4">
          <TabsTrigger
            value="bubbles"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white text-sm"
          >
            Tampilan Bubble
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white text-sm"
          >
            Tampilan Tabel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bubbles" className="m-0">
          {/* Bubble Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: window.innerWidth < 768 ? "400px" : "600px" }}
            />
          </div>
        </TabsContent>

        <TabsContent value="table" className="m-0">
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[800px]">
              <thead className="bg-[#2a2a2a] border-y border-gray-800">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-400">#</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-400">Nama</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Harga</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Market Cap</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Volume 24j</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Jam</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Hari</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Minggu</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Bulan</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-400">Tahun</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-400">Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((stock, index) => (
                  <tr key={stock.id} className="border-b border-gray-800 hover:bg-[#2a2a2a]">
                    <td className="px-2 md:px-4 py-2 md:py-3 text-gray-400">{index + 1}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {stock.symbol.charAt(0)}
                        </div>
                        <span className="font-medium">{stock.name}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right">{formatPrice(stock.price)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right">{formatNumber(stock.marketCap)}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right">{formatNumber(stock.volume24h)}</td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-right ${getChangeColor(stock.hourChange)}`}>
                      {stock.hourChange > 0 ? "+" : ""}
                      {stock.hourChange.toFixed(1)}%
                    </td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-right ${getChangeColor(stock.dayChange)}`}>
                      {stock.dayChange > 0 ? "+" : ""}
                      {stock.dayChange.toFixed(1)}%
                    </td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-right ${getChangeColor(stock.weekChange)}`}>
                      {stock.weekChange > 0 ? "+" : ""}
                      {stock.weekChange.toFixed(1)}%
                    </td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-right ${getChangeColor(stock.monthChange)}`}>
                      {stock.monthChange > 0 ? "+" : ""}
                      {stock.monthChange.toFixed(1)}%
                    </td>
                    <td className={`px-2 md:px-4 py-2 md:py-3 text-right ${getChangeColor(stock.yearChange)}`}>
                      {stock.yearChange > 0 ? "+" : ""}
                      {stock.yearChange.toFixed(1)}%
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-5 h-5 md:w-6 md:h-6 text-blue-400">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-5 h-5 md:w-6 md:h-6 text-green-400">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
