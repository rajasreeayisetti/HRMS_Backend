const supabase = require('../config/supabase');

exports.getDashboardData = async (req, res) => {
    try {
        const { year, month } = req.query;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // 1. Total Candidates (Global)
        const { count: totalCandidates, error: err1 } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true });

        // 2. Placed Candidates (Global)
        const { count: placedCandidates, error: err2 } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Placed');

        // 3. Fetch detailed data for calculation
        // We fetch more here to handle filtering by year/month in memory for derived stats
        const { data: allCandidates, error: err4 } = await supabase
            .from('candidates')
            .select('status, paid_amount, created_at');

        if (err4) throw err4;

        // Filter by year if provided
        const filteredByYear = year 
            ? allCandidates.filter(c => new Date(c.created_at).getFullYear() === parseInt(year))
            : allCandidates;

        const activeData = (month && month !== "-1")
            ? filteredByYear.filter(c => new Date(c.created_at).getMonth() === parseInt(month))
            : filteredByYear;

        const totalRevenue = activeData
            ? activeData
                .reduce((sum, item) => sum + (Number(item.paid_amount) || 0), 0) 
            : 0;

        // 4. Status Distribution (for the filtered period)
        const pieData = [
            { name: 'Placed', value: 0 },
            { name: 'Training', value: 0 },
            { name: 'Pending', value: 0 }
        ];

        activeData.forEach(c => {
            if (c.status === 'Placed') pieData[0].value++;
            else if (c.status === 'Training') pieData[1].value++;
            else if (c.status === 'Pending') pieData[2].value++;
        });

        // 5. Monthly Revenue (for the selected year)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRevenueMap = {};
        
        filteredByYear.forEach(c => {
            if (Number(c.paid_amount) > 0) {
                const date = new Date(c.created_at);
                const monthName = months[date.getMonth()];
                monthlyRevenueMap[monthName] = (monthlyRevenueMap[monthName] || 0) + Number(c.paid_amount);
            }
        });

        const barData = months.map(m => ({
            name: m,
            income: monthlyRevenueMap[m] || 0
        })).filter(item => {
            const mIndex = months.indexOf(item.name);
            if (year && parseInt(year) < currentYear) return true; // Show all months for past years
            if (year && parseInt(year) > currentYear) return false; // Future years
            return item.income > 0 || mIndex <= currentMonth; // Show up to current month for this year
        });

        res.status(200).json({
            success: true,
            data: {
                totalCandidates: activeData ? activeData.length : 0,
                placedCandidates: pieData[0].value,
                totalRevenue,
                pieData,
                barData,
                lineData: barData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
