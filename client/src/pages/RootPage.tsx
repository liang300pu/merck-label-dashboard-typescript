import { useEffect, useRef, useState } from 'react'
import NavBar from '../components/NavBar'
import { useFetchAll } from '../redux'
import { Chart } from 'chart.js/auto'
import {
    getMonthlySampleCountForAllTeams,
    getSampleCountForAllTeams,
} from '../api'

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

    const monthDayToString = {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
    } as const

    const [chartData, setChartData] = useState<number[]>([])

    useEffect(() => {
        getMonthlySampleCountForAllTeams().then((data) => {
            const stats = data.data
            const cdata: number[] = []
            Object.entries(monthDayToString).forEach(([k, v]) => {
                let stat = stats.find((stat) => stat.month === k)
                if (stat) {
                    cdata.push(stat.count as number)
                } else {
                    cdata.push(0)
                }
            })
            setChartData(cdata)
        })
    }, [])

    useEffect(() => {
        let chart: Chart | null = null
        if (chartRef.current !== null) {
            chart = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.values(monthDayToString),
                    datasets: [
                        {
                            label: 'Samples by Month',
                            data: chartData,
                        },
                    ],
                },
            })
        }

        return () => chart?.destroy()
    }, [chartRef, chartData])

    return (
        <>
            <NavBar />
            <canvas ref={chartRef} />
        </>
    )
}

export default RootPage
