import { useEffect, useRef, useState } from 'react'
import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts'

export default function AdvancedChart({ 
  data = [], 
  type = 'candlestick', 
  height = 400,
  className = ""
}) {
  const chartContainerRef = useRef()
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#a18266', // Muted brown/gray matching Sarvex
      },
      grid: {
        vertLines: { color: 'rgba(28, 16, 0, 0.5)' },
        horzLines: { color: 'rgba(28, 16, 0, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        borderColor: '#1c1000',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1c1000',
      },
      crosshair: {
        vertLine: { color: '#f97316', labelBackgroundColor: '#f97316' },
        horzLine: { color: '#f97316', labelBackgroundColor: '#f97316' }
      }
    })
    
    chartRef.current = chart

    let series
    if (type === 'candlestick') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e', 
        downColor: '#ef4444', 
        borderVisible: false,
        wickUpColor: '#22c55e', 
        wickDownColor: '#ef4444',
      })
    } else {
      series = chart.addSeries(AreaSeries, {
        lineColor: '#f97316',
        topColor: 'rgba(249, 115, 22, 0.4)',
        bottomColor: 'rgba(249, 115, 22, 0.0)',
      })
    }

    seriesRef.current = series

    if (data && data.length > 0) {
      if (type === 'candlestick') {
        series.setData(data)
      } else {
        // Area series expects `{ time, value }`
        series.setData(data.map(d => ({ time: d.time, value: d.close !== undefined ? d.close : d.value })))
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [type, height])

  // Update data if it changes without tearing down the chart
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      if (type === 'candlestick') {
        seriesRef.current.setData(data)
      } else {
        seriesRef.current.setData(data.map(d => ({ time: d.time, value: d.close !== undefined ? d.close : d.value })))
      }
    }
  }, [data, type])

  return (
    <div ref={chartContainerRef} className={`w-full relative ${className}`} />
  )
}
