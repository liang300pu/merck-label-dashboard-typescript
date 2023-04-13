import { useEffect, useRef } from 'react'
import NavBar from '../components/NavBar'
import { useFetchAll } from '../redux'
import { Chart } from 'chart.js/auto'

const RootPage = () => {
    /**
     * Root page will fetch ALL data from the server and
     * populate the redux store with it.
     */

    const fetchAll = useFetchAll()

    useEffect(() => {
        fetchAll()
    }, [])

    const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
    ] as const

    const chartRef = useRef<HTMLCanvasElement>(null)

    // use the api to get the data

    useEffect(() => {
        let chart: Chart | null = null
        if (chartRef.current !== null)
            chart = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: data.map((row) => row.year),
                    datasets: [
                        {
                            label: 'Test',
                            data: data.map((row) => row.count),
                        },
                    ],
                },
            })

        return () => chart?.destroy()
    }, [chartRef])

    return (
        <>
            <NavBar />
            <canvas ref={chartRef} />
        </>
    )
}

export default RootPage
