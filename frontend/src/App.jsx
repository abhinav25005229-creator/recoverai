
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar
} from "recharts";
import axios from "axios";
import { io } from "socket.io-client";
import {
    Activity,
    BrainCircuit,
    CircleDollarSign,
    ShieldCheck,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}


function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-zinc-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-white">
                        {value}
                    </h3>

                    <p className="mt-2 text-xs text-zinc-500">
                        {subtitle}
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-800 p-3">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}


function App() {

    const [stats, setStats] = useState(null);
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTransaction, setSelectedTransaction] =
    useState(null);
    const [humanReviews, setHumanReviews] =
    useState([]);
    const [insights, setInsights] =
    useState([]);
    const [experiment, setExperiment] =
    useState(null);

const [experimentLoading, setExperimentLoading] =
    useState(false);
const [revenueAnalytics, setRevenueAnalytics] =
    useState(null);

const [failureAnalytics, setFailureAnalytics] =
    useState([]);

const [strategyAnalytics, setStrategyAnalytics] =
    useState([]);

const [dailyAnalytics, setDailyAnalytics] =
    useState([]);
const [transactionDetails, setTransactionDetails] =
    useState(null);

const [detailsLoading, setDetailsLoading] =
    useState(false);
const [strategyPerformance, setStrategyPerformance] =
    useState([]);
const [agentEvents, setAgentEvents] =
    useState([]);
const [simulating, setSimulating] =
    useState(false);

const [simulationMessage, setSimulationMessage] =
    useState("");
const [pipelineStatus, setPipelineStatus] =
    useState({});

const updateHumanReview = async (
    reviewId,
    action
) => {

    try {

    const response =
    await axios.post(
        `${API_URL}/api/reviews/${reviewId}/resolve`,
        {
            action,
            note:
                `Review ${action.toLowerCase()} from dashboard`
        }
    );

        if (response.data.success) {

            setHumanReviews(
                previousReviews =>
                    previousReviews.filter(
                        review =>
                            review.review_id !==
                            reviewId
                    )
            );

            alert(
                `Review ${action.toLowerCase()} successfully`
            );

        }

    } catch (error) {

        console.error(
            "Failed to resolve review:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Failed to resolve human review"
        );

    }

};
   useEffect(() => {

    loadDashboard();

    loadAnalytics();

}, []);

useEffect(() => {

   fetch(
    `${API_URL}/api/human-reviews`
)
        .then(response =>
            response.json()
        )
        .then(result => {

            if (result.success) {

                setHumanReviews(
                    result.data
                );

            }

        })
        .catch(error => {

            console.error(
                "Failed to load human reviews:",
                error
            );

        });

}, []);
useEffect(() => {

    const API_URL = import.meta.env.VITE_API_URL;

const socket =
    io(API_URL);

    socket.on(
        "connect",
        () => {

            console.log(
                "🔌 Socket connected:",
                socket.id
            );

        }
    );

socket.on(
    "agent.activity",
    (event) => {

        console.log(
            "🤖 Agent Event:",
            event
        );

        setAgentEvents(
            (previous) => [
                ...previous,
                event
            ]
        );

        setPipelineStatus(
            (previous) => ({
                ...previous,
                [event.agent]: event.status
            })
        );

        if (
            event.agent === "SYSTEM" &&
            event.transactionId
        ) {

            openTransaction(
                event.transactionId
            );

        }

    }
);

    socket.on(
        "disconnect",
        () => {

            console.log(
                "🔌 Socket disconnected"
            );

        }
    );

    return () => {

        socket.disconnect();

    };

}, []);

    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const [
                statsResponse,
                decisionsResponse,
            ] = await Promise.all([
               axios.get(
    `${API_URL}/api/dashboard/stats`
),

               axios.get(
    `${API_URL}/api/dashboard/decisions`
),
            ]);


            setStats(
                statsResponse.data.data
            );


            setDecisions(
                decisionsResponse.data.data || []
            );

        } catch (err) {

            console.error(
                "Dashboard loading failed:",
                err
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }
    }

    async function loadAnalytics() {

    try {
      const strategyResponse =
    await axios.get(
       `${API_URL}/api/strategies/performance`
    );

setStrategyPerformance(
    strategyResponse.data.data
);
        const [
            revenue,
            failures,
            strategies,
            daily
        ] = await Promise.all([

   axios.get(
    `${API_URL}/api/analytics/revenue`
),
          axios.get(
    `${API_URL}/api/analytics/failures`
),

           axios.get(
    `${API_URL}/api/analytics/strategies`
),

         axios.get(
    `${API_URL}/api/analytics/daily`
)

        ]);


        setRevenueAnalytics(
            revenue.data.data
        );


        setFailureAnalytics(
            failures.data.data
        );


        setStrategyAnalytics(
            strategies.data.data
        );


        setDailyAnalytics(
            daily.data.data
        );


    } catch (error) {

        console.error(
            "Analytics loading failed:",
            error
        );

    }

}
async function runRecoveryExperiment() {

    try {

        setExperimentLoading(true);


        const response =
            await axios.get(
              `${API_URL}/api/experiment/run?count=1000`
            );


        setExperiment(
            response.data.data
        );


    } catch (error) {

        console.error(
            "Experiment failed:",
            error
        );

    } finally {

        setExperimentLoading(false);

    }

}

 async function simulatePayment() {

    try {

        setSimulating(true);

        setSimulationMessage("");


        const response =
            await axios.post(
               `${API_URL}/api/payments/simulate`
            );


        const payment =
            response.data.data;


        console.log(
            "💳 Simulated payment:",
            payment
        );


        setSimulationMessage(
            `Payment created: ${payment.transaction_id}`
        );


       // Refresh immediately after transaction creation
await loadDashboard();

const reviewsResponse = await axios.get(
    `${API_URL}/api/human-reviews`
);

if (reviewsResponse.data.success) {
    setHumanReviews(
        reviewsResponse.data.data || []
    );
}

// Give RecoverAI a moment to finish processing
setTimeout(async () => {

    await loadDashboard();

}, 2000);

// Open transaction intelligence
await openTransaction(
    payment.transaction_id
);


    } catch (error) {

        console.error(
            "Simulation failed:",
            error
        );


        setSimulationMessage(
            "Failed to simulate payment"
        );


    } finally {

        setSimulating(false);

    }

}

async function openTransaction(transactionId) {

    try {

        setSelectedTransaction(transactionId);

        setDetailsLoading(true);

        const response =
            await axios.get(
                `${API_URL}/api/transactions/${transactionId}`
            );

        setTransactionDetails(
            response.data.data
        );

    } catch (error) {

        console.error(
            "Transaction details failed:",
            error
        );

    } finally {

        setDetailsLoading(false);

    }
}

    return (
        <div className="min-h-screen bg-black text-white">

            {/* ================= HEADER ================= */}

            <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/90 backdrop-blur">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl border border-zinc-800 p-2">
                            <BrainCircuit size={24} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">
                                RecoverAI
                            </h1>

                            <p className="text-xs text-zinc-500">
                                Autonomous Payment Recovery
                            </p>
                        </div>

                    </div>


                    <div className="flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-green-500" />

                        <span className="text-sm text-zinc-400">
                            AI System Online
                        </span>

                    </div>

                </div>

            </header>


            {/* ================= MAIN ================= */}

            <main className="mx-auto max-w-7xl px-8 py-8">

                {/* ================= TITLE ================= */}

             <div className="mb-8">

    <div className="flex items-center justify-between">

        <div>

            <h2 className="text-3xl font-bold">
                Recovery Dashboard
            </h2>

            <p className="mt-2 text-zinc-500">
                Real-time AI payment recovery intelligence
            </p>

        </div>


 <button
    onClick={simulatePayment}
    disabled={simulating}
    className="
        rounded-lg
        bg-white
        px-4
        py-2
        text-sm
        font-medium
        text-black
        hover:bg-zinc-200
        disabled:cursor-not-allowed
        disabled:opacity-50
    "
>
    {simulating
        ? "Simulating..."
        : "+ Simulate Failed Payment"
    }
</button>

{simulationMessage && (
    <p className="
        mt-3
        text-right
        text-xs
        text-zinc-400
    ">
        {simulationMessage}
    </p>
)}

    </div>

</div>


                {/* ================= ERROR ================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">

                        {error}

                    </div>

                )}


                {/* ================= STATS ================= */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        title="Revenue Recovered"
                        value={
                            loading
                                ? "Loading..."
                                : formatCurrency(
                                    stats?.revenueRecovered
                                )
                        }
                        subtitle="Recovered by AI"
                        icon={CircleDollarSign}
                    />


                    <StatCard
                        title="Revenue At Risk"
                        value={
                            loading
                                ? "Loading..."
                                : formatCurrency(
                                    stats?.revenueAtRisk
                                )
                        }
                        subtitle={
                            `${stats?.failedPayments || 0} failed payments`
                        }
                        icon={AlertTriangle}
                    />


                    <StatCard
                        title="Recovery Rate"
                        value={
                            loading
                                ? "Loading..."
                                : `${stats?.recoveryRate || 0}%`
                        }
                        subtitle="AI-assisted recovery"
                        icon={TrendingUp}
                    />


                    <StatCard
                        title="AI Interventions"
                        value={
                            loading
                                ? "Loading..."
                                : Number(
                                    stats?.aiInterventions || 0
                                ).toLocaleString()
                        }
                        subtitle="Automated decisions"
                        icon={Activity}
                    />

                </div>
<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <div className="
        flex
        justify-between
        items-center
    ">

        <div>

            <h3 className="font-semibold">
                Revenue Impact
            </h3>

            <p className="
                mt-1
                text-xs
                text-zinc-500
            ">
                Financial impact of AI recovery
            </p>

        </div>
        <button
        onClick={() => {
            loadAnalytics();
            loadReviews();
        }}
        className="
            rounded-lg
            border
            border-zinc-800
            px-3
            py-2
            text-xs
            text-zinc-400
            hover:bg-zinc-900
        "
    >
        Refresh
    </button>

    </div>

<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <h3 className="font-semibold">
        Failure Analysis
    </h3>

    <p className="
        mt-1
        text-xs
        text-zinc-500
    ">
        Where revenue is being lost
    </p>

    <div className="
        mt-6
        h-72
    ">

        <ResponsiveContainer
            width="100%"
            height="100%"
        >

            <BarChart
                data={failureAnalytics}
            >

                <XAxis
                    dataKey="failureReason"
                />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="attempts"
                />

            </BarChart>

        </ResponsiveContainer>

    </div>

</div>

<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <h3 className="font-semibold">
        Adaptive Strategy Learning
    </h3>

    <p className="
        mt-1
        text-xs
        text-zinc-500
    ">
        Historical recovery performance by strategy
    </p>

    <div className="
        mt-6
        space-y-4
    ">

        {strategyPerformance.map(
            strategy => (

                <div
                    key={strategy.strategy}
                >

                    <div className="
                        flex
                        justify-between
                        text-sm
                    ">

                        <span>
                            {strategy.strategy}
                        </span>

                        <span>
                            {strategy.successRate}%
                        </span>

                    </div>

                    <div className="
                        mt-2
                        h-2
                        rounded-full
                        bg-zinc-800
                    ">

                        <div
                            className="
                                h-full
                                rounded-full
                                bg-white
                            "
                            style={{
                                width:
                                    `${strategy.successRate}%`
                            }}
                        />

                    </div>

                </div>

            )
        )}

    </div>

</div>
<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <h3 className="font-semibold">
        Strategy Performance
    </h3>

    <p className="
        mt-1
        text-xs
        text-zinc-500
    ">
        Which AI strategies recover the most payments
    </p>

    <div className="
        mt-6
        space-y-4
    ">

        {strategyAnalytics.map(
            strategy => (

                <div
                    key={strategy.strategy}
                >

                    <div className="
                        flex
                        justify-between
                        text-sm
                    ">

                        <span>
                            {strategy.strategy}
                        </span>

                        <span>
                            {strategy.successRate}%
                        </span>

                    </div>

                    <div className="
                        mt-2
                        h-2
                        rounded-full
                        bg-zinc-800
                    ">

                        <div
                            className="
                                h-full
                                rounded-full
                                bg-white
                            "
                            style={{
                                width:
                                    `${strategy.successRate}%`
                            }}
                        />

                    </div>

                </div>

            )
        )}

    </div>

</div>



<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <h3 className="font-semibold">
        Recovery Trend
    </h3>

    <p className="
        mt-1
        text-xs
        text-zinc-500
    ">
        Payment failure volume over time
    </p>

    <div className="
        mt-6
        h-72
    ">

        <ResponsiveContainer
            width="100%"
            height="100%"
        >

            <LineChart
                data={dailyAnalytics}
            >

                <XAxis
                    dataKey="date"
                />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="failedPayments"
                    strokeWidth={2}
                />

            </LineChart>

        </ResponsiveContainer>

    </div>

</div>

<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <div className="
        flex
        items-center
        gap-3
    ">

        <BrainCircuit size={20} />

        <div>

            <h3 className="font-semibold">
                AI Insights
            </h3>

            <p className="
                text-xs
                text-zinc-500
            ">
                Automated revenue intelligence
            </p>

        </div>

    </div>


    <div className="
        mt-6
        space-y-4
    ">

        {insights.map(
            (insight, index) => (

                <div
                    key={index}
                    className="
                        rounded-xl
                        bg-zinc-900
                        p-5
                    "
                >

                    <p className="
                        text-sm
                        font-semibold
                    ">

                        {insight.title}

                    </p>


                    <p className="
                        mt-2
                        text-sm
                        leading-6
                        text-zinc-400
                    ">

                        {insight.message}

                    </p>

                </div>

            )
        )}

    </div>

</div>

    <div className="
        mt-6
        grid
        grid-cols-1
        md:grid-cols-3
        gap-4
    ">

        <AnalyticsMetric
            label="Revenue At Risk"
            value={
                revenueAnalytics
                    ? formatCurrency(
                        revenueAnalytics.revenueAtRisk
                    )
                    : "Loading..."
            }
        />


        <AnalyticsMetric
            label="Recovered Revenue"
            value={
                revenueAnalytics
                    ? formatCurrency(
                        revenueAnalytics.successfulRevenue
                    )
                    : "Loading..."
            }
        />


        <AnalyticsMetric
            label="Successful Payments"
            value={
                revenueAnalytics
                    ? revenueAnalytics.successfulPayments
                    : "Loading..."
            }
        />

    </div>

</div>

                {/* ================= SYSTEM STATUS ================= */}

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                        <div className="flex items-center gap-3">

                            <BrainCircuit size={20} />

                            <div>
                                <p className="text-sm font-semibold">
                                    ML Engine
                                </p>

                                <p className="text-xs text-green-500">
                                    Connected
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                        <div className="flex items-center gap-3">

                            <ShieldCheck size={20} />

                            <div>
                                <p className="text-sm font-semibold">
                                    Guardrails
                                </p>

                                <p className="text-xs text-green-500">
                                    Active
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

                        <div className="flex items-center gap-3">

                            <Activity size={20} />

                            <div>
                                <p className="text-sm font-semibold">
                                    Event System
                                </p>

                                <p className="text-xs text-green-500">
                                    Listening
                                </p>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ================= AI DECISIONS ================= */}

                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950">

                    <div className="border-b border-zinc-800 p-6">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-lg font-bold">
                                    Live AI Decisions
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Latest automated recovery decisions
                                </p>

                            </div>


                            <button
                                onClick={loadDashboard}
                                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-900"
                            >
                                Refresh
                            </button>

                        </div>

                    </div>


                    {/* ================= TABLE ================= */}

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">

                                <tr>

                                    <th className="px-6 py-4">
                                        Transaction
                                    </th>

                                    <th className="px-6 py-4">
                                        Failure
                                    </th>

                                    <th className="px-6 py-4">
                                        Confidence
                                    </th>

                                    <th className="px-6 py-4">
                                        Action
                                    </th>

                                    <th className="px-6 py-4">
                                        Category
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="px-6 py-10 text-center text-zinc-500"
                                        >
                                            Loading AI decisions...
                                        </td>

                                    </tr>

                                )}


                                {!loading &&
                                    decisions.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="px-6 py-10 text-center text-zinc-500"
                                            >
                                                No AI decisions found.
                                            </td>

                                        </tr>

                                    )}


                                {!loading &&
                                    decisions.map((decision) => (

                                        <tr
                                            key={
                                                decision.decision_id
                                            }
                                            className="border-b border-zinc-900 hover:bg-zinc-900"
                                        >
<td className="px-6 py-4">
    {decision.transaction_id}
</td>


                                            <td className="px-6 py-4 text-zinc-400">

                                                {decision.failure_category}

                                            </td>


                                            <td className="px-6 py-4">

                                                {decision.confidence != null
                                                    ? `${Math.round(
                                                        Number(
                                                            decision.confidence
                                                        ) * 100
                                                    )}%`
                                                    : "—"
                                                }

                                            </td>


                                            <td className="px-6 py-4">

                                                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs">

                                                    {
                                                        decision.recommended_action
                                                    }

                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-zinc-400">

                                                {decision.failure_category}

                                            </td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                    </div>

                </div>

<div className="
    mt-6
    rounded-2xl
    border
    border-zinc-800
    bg-zinc-950
    p-6
">

    <div className="
        flex
        justify-between
        items-center
    ">

        <div>

            <h3 className="font-semibold">
                AI Recovery Experiment
            </h3>

            <p className="
                mt-1
                text-xs
                text-zinc-500
            ">
                Compare baseline recovery with RecoverAI
            </p>

        </div>


        <button
            onClick={
                runRecoveryExperiment
            }
            disabled={
                experimentLoading
            }
            className="
                rounded-xl
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                text-black
                disabled:opacity-50
            "
        >

            {experimentLoading
                ? "Running..."
                : "Run Experiment"
            }

        </button>

    </div>


    {experiment && (

        <div className="
            mt-6
        ">


            <div className="
                grid
                md:grid-cols-2
                gap-4
            ">


                <div className="
                    rounded-xl
                    bg-zinc-900
                    p-5
                ">

                    <p className="
                        text-xs
                        text-zinc-500
                    ">
                        Without AI
                    </p>


                    <p className="
                        mt-2
                        text-3xl
                        font-semibold
                    ">

                        {
                            experiment
                                .baseline
                                .recoveryRate
                        }%

                    </p>


                    <p className="
                        mt-2
                        text-sm
                        text-zinc-500
                    ">

                        Recovery Rate

                    </p>


                    <p className="
                        mt-4
                        text-sm
                    ">

                        {
                            formatCurrency(
                                experiment
                                    .baseline
                                    .revenueRecovered
                            )
                        }

                    </p>

                </div>


                <div className="
                    rounded-xl
                    bg-zinc-900
                    p-5
                ">

                    <p className="
                        text-xs
                        text-zinc-500
                    ">
                        RecoverAI
                    </p>


                    <p className="
                        mt-2
                        text-3xl
                        font-semibold
                    ">

                        {
                            experiment
                                .recoverAI
                                .recoveryRate
                        }%

                    </p>


                    <p className="
                        mt-2
                        text-sm
                        text-zinc-500
                    ">

                        Recovery Rate

                    </p>


                    <p className="
                        mt-4
                        text-sm
                    ">

                        {
                            formatCurrency(
                                experiment
                                    .recoverAI
                                    .revenueRecovered
                            )
                        }

                    </p>

                </div>

            </div>


            <div className="
                mt-4
                rounded-xl
                bg-zinc-900
                p-6
                text-center
            ">

                <p className="
                    text-xs
                    text-zinc-500
                ">
                    Recovery Improvement
                </p>


                <p className="
                    mt-2
                    text-4xl
                    font-bold
                ">

                    +{
                        experiment
                            .improvement
                            .recoveryRate
                    } pts

                </p>


                <p className="
                    mt-2
                    text-sm
                    text-zinc-500
                ">

                    Simulated improvement over baseline

                </p>


                <p className="
                    mt-4
                    text-sm
                ">

                    Additional simulated revenue:

                    <span className="
                        ml-2
                        font-semibold
                    ">

                        {
                            formatCurrency(
                                experiment
                                    .improvement
                                    .revenue
                            )
                        }

                    </span>

                </p>

            </div>

        </div>

    )}

</div>


{/* ================= HUMAN REVIEW QUEUE ================= */}

<div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950">

    <div className="border-b border-zinc-800 p-6">

        <div className="flex items-center justify-between">

            <div>
                <h2 className="text-lg font-bold">
                    Human Review Queue
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    High-risk transactions requiring manual review
                </p>
            </div>

            <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
                {humanReviews.length} Pending
            </span>

        </div>

    </div>


    <div className="p-6">

        {humanReviews.length === 0 ? (

            <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
                No human review cases.
            </div>

        ) : (

            <div className="grid gap-4">

                {humanReviews.map((review) => (

                    <div
                        key={
                            review.review_id ||
                            review.transaction_id
                        }
                        className="rounded-xl border border-zinc-800 p-5"
                    >

                        {/* HEADER */}

                        <div className="flex items-center justify-between">

                            <div>

                                <button
                                    onClick={() =>
                                        openTransaction(
                                            review.transaction_id
                                        )
                                    }
                                    className="font-semibold hover:underline"
                                >
                                    {review.transaction_id}
                                </button>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Review ID: {review.review_id}
                                </p>

                            </div>


                            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs">
                                {review.status || "PENDING"}
                            </span>

                        </div>


                        {/* REVIEW DETAILS */}

                        <div className="mt-5 grid gap-4 md:grid-cols-3">

                            <div>

                                <p className="text-xs text-zinc-500">
                                    Risk Score
                                </p>

                                <p className="mt-1 text-lg font-semibold">
                                    {review.risk_score ?? "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-zinc-500">
                                    Amount
                                </p>

                                <p className="mt-1 text-lg font-semibold">
                                    ₹{review.amount ?? "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-zinc-500">
                                    Recommended Action
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {review.recommended_action || "N/A"}
                                </p>

                            </div>

                        </div>


                        {/* REASON */}

                        <div className="mt-5">

                            <p className="text-xs text-zinc-500">
                                Review Reason
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                                {review.reason ||
                                    "Manual review required"}
                            </p>

                        </div>


                        {/* ACTIONS */}

                        <div className="mt-5 flex gap-3">

                            <button
                                onClick={() =>
                                    updateHumanReview(
                                        review.review_id,
                                        "APPROVED"
                                    )
                                }
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                            >
                                Approve
                            </button>


                            <button
                                onClick={() =>
                                    updateHumanReview(
                                        review.review_id,
                                        "REJECTED"
                                    )
                                }
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                            >
                                Reject
                            </button>


                            <button
                                onClick={() =>
                                    openTransaction(
                                        review.transaction_id
                                    )
                                }
                                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                            >
                                View Details
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        )}

    </div>

</div>

                {/* ================= AI PIPELINE ================= */}

                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

                    <h2 className="text-lg font-bold">
                        AI Recovery Pipeline
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-6">

                       <PipelineStep
    number="01"
    title="Failure"
    status={pipelineStatus.FAILURE_ANALYZER}
/>

                       <PipelineStep
    number="02"
    title="Customer"
    status={pipelineStatus.CUSTOMER_INTELLIGENCE}
/>

                      <PipelineStep
    number="03"
    title="ML Score"
    status={pipelineStatus.ML_MODEL}
/>

                       <PipelineStep
    number="04"
    title="Strategy"
    status={pipelineStatus.LLM_STRATEGY}
/>

                      <PipelineStep
    number="05"
    title="Guardrails"
    status={pipelineStatus.GUARDRAILS}
/>

                        <PipelineStep
                            number="06"
                            title="Action"
                        />

                    </div>

                </div>
              <LiveActivity
    events={agentEvents.filter(
        (event) =>
            !selectedTransaction ||
            event.transactionId === selectedTransaction
    )}
/>
                {selectedTransaction && (
    <TransactionModal
        loading={detailsLoading}
        data={transactionDetails}
        onClose={() => {
            setSelectedTransaction(null);
            setTransactionDetails(null);
        }}
    />
)}
            </main>

        </div>
    );
}


function PipelineStep({
    number,
    title,
    status
}) {

    return (
        <div className="rounded-xl border border-zinc-800 p-4 text-center">

            <div className="text-xs text-zinc-600">
                {number}
            </div>

            <div className="mt-2 text-sm font-semibold">
                {title}
            </div>

        </div>
    );
}
function TransactionModal({
    loading,
    data,
    onClose
}) {

    if (loading) {

        return (

            <div className="
                fixed
                inset-0
                z-50
                bg-black/70
                flex
                items-center
                justify-center
            ">

                <div className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-8
                ">

                    Loading AI intelligence...

                </div>

            </div>

        );

    }


    if (!data) {
        return null;
    }


    const transaction =
        data.transaction;


    const decisions =
        data.ai_decisions || [];


    const attempts =
        data.recovery_attempts || [];


    const latestDecision =
        decisions[0];


    const latestAttempt =
        attempts[attempts.length - 1];


    return (

        <div className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            justify-end
        ">


            <div className="
                h-full
                w-full
                max-w-2xl
                overflow-y-auto
                bg-zinc-950
                border-l
                border-zinc-800
                p-8
            ">


                {/* HEADER */}

                <div className="
                    flex
                    justify-between
                    items-start
                ">

                    <div>

                        <p className="
                            text-xs
                            text-zinc-500
                        ">
                            Transaction Intelligence
                        </p>

                        <h2 className="
                            mt-1
                            text-2xl
                            font-semibold
                        ">

                            {transaction.transaction_id}

                        </h2>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                            text-zinc-500
                            hover:text-white
                            text-xl
                        "
                    >
                        ×
                    </button>

                </div>


                {/* PAYMENT */}

                <div className="
                    mt-8
                    grid
                    grid-cols-2
                    gap-3
                ">

                    <InfoBox
                        label="Amount"
                        value={
                            formatCurrency(
                                Number(
                                    transaction.amount
                                )
                            )
                        }
                    />

                    <InfoBox
                        label="Payment Method"
                        value={
                            transaction.payment_method
                        }
                    />

                    <InfoBox
                        label="Failure"
                        value={
                            transaction.failure_reason
                        }
                    />

                    <InfoBox
                        label="Status"
                        value={
                            transaction.status
                        }
                    />

                </div>


                {/* RECOVERY SCORE */}

                <div className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-800
                    p-6
                ">

                    <p className="
                        text-sm
                        text-zinc-500
                    ">
                        Recovery Probability
                    </p>


                    <div className="
                        mt-2
                        flex
                        items-end
                        gap-2
                    ">

                        <span className="
                            text-5xl
                            font-bold
                        ">

                            {latestDecision
                                ? Math.round(
                                    Number(
                                        latestDecision
                                            .recovery_probability
                                    ) * 100
                                )
                                : 0
                            }%

                        </span>

                    </div>


                    <div className="
                        mt-4
                        h-2
                        rounded-full
                        bg-zinc-800
                        overflow-hidden
                    ">

                        <div
                            className="
                                h-full
                                bg-white
                            "
                            style={{
                                width: `${
                                    latestDecision
                                        ? Number(
                                            latestDecision
                                                .recovery_probability
                                        ) * 100
                                        : 0
                                }%`
                            }}
                        />

                    </div>

                </div>


                {/* CUSTOMER INTELLIGENCE */}

                <div className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-800
                    p-6
                ">

                    <h3 className="
                        font-semibold
                    ">
                        Customer Intelligence
                    </h3>


                    <div className="
                        mt-5
                        grid
                        grid-cols-2
                        gap-4
                    ">

                        <InfoBox
                            label="Customer"
                            value={
                                transaction.name
                            }
                        />

                        <InfoBox
                            label="Total Transactions"
                            value={
                                transaction.total_transactions
                            }
                        />

                        <InfoBox
                            label="Successful"
                            value={
                                transaction.successful_transactions
                            }
                        />

                        <InfoBox
                            label="Preferred Method"
                            value={
                                transaction.preferred_payment_method
                            }
                        />

                    </div>

                </div>


                {/* AI REASONING */}

                <div className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-800
                    p-6
                ">

                    <h3 className="
                        font-semibold
                    ">
                        AI Reasoning
                    </h3>


                    <p className="
                        mt-4
                        text-sm
                        leading-6
                        text-zinc-400
                    ">

                        {latestDecision?.reasoning ||
                            "No reasoning available yet."
                        }

                    </p>

                </div>


                {/* AGENT TIMELINE */}

                <div className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-800
                    p-6
                ">

                    <h3 className="
                        font-semibold
                    ">
                        Agent Timeline
                    </h3>


                    <div className="
                        mt-6
                        space-y-5
                    ">

                        <TimelineItem
                            title="Failure Analyzer"
                            text={
                                latestDecision?.failure_category ||
                                "Analyzed"
                            }
                        />

                        <TimelineItem
                            title="Customer Intelligence"
                            text="Customer profile analyzed"
                        />

                        <TimelineItem
                            title="ML Recovery Model"
                            text={
                                latestDecision
                                    ? `Recovery probability ${
                                        Math.round(
                                            Number(
                                                latestDecision
                                                    .recovery_probability
                                            ) * 100
                                        )
                                    }%`
                                    : "Prediction generated"
                            }
                        />

                        <TimelineItem
                            title="Strategy Agent"
                            text={
                                latestDecision?.recommended_action ||
                                "Strategy selected"
                            }
                        />

                        <TimelineItem
                            title="Guardrails"
                            text="Decision validated"
                        />

                        <TimelineItem
                            title="Action Agent"
                            text={
                                latestAttempt?.action ||
                                "Action executed"
                            }
                        />

                        <TimelineItem
                            title="Result"
                            text={
                                latestAttempt?.result ||
                                "Awaiting result"
                            }
                        />

                    </div>

                </div>
<div className="
    mt-4
    rounded-2xl
    border
    border-zinc-800
    p-6
">

    <h3 className="font-semibold">
        Agent Memory
    </h3>

    <p className="
        mt-1
        text-xs
        text-zinc-500
    ">
        What RecoverAI remembers about this payment
    </p>


    <div className="
        mt-5
        space-y-3
    ">

        {(
            data.agent_memory || []
        ).map(
            (memory, index) => (

                <div
                    key={index}
                    className="
                        rounded-xl
                        bg-zinc-900
                        p-4
                    "
                >

                    <div className="
                        flex
                        justify-between
                    ">

                        <span className="
                            text-sm
                            font-medium
                        ">

                            {memory.agent}

                        </span>


                        <span className="
                            text-xs
                            text-zinc-600
                        ">

                            {memory.memory_type}

                        </span>

                    </div>


                    <pre className="
                        mt-3
                        overflow-x-auto
                        text-xs
                        text-zinc-500
                    ">

                        {JSON.stringify(
                            memory.content,
                            null,
                            2
                        )}

                    </pre>

                </div>

            )
        )}

    </div>

</div>

                {/* RECOVERY ATTEMPTS */}

                <div className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-800
                    p-6
                ">

                    <h3 className="
                        font-semibold
                    ">
                        Recovery Attempts
                    </h3>


                    <div className="
                        mt-5
                        space-y-3
                    ">

                        {attempts.map(
                            attempt => (

                                <div
                                    key={
                                        attempt.attempt_id
                                    }
                                    className="
                                        flex
                                        justify-between
                                        rounded-xl
                                        bg-zinc-900
                                        p-4
                                    "
                                >

                                    <div>

                                        <p className="
                                            text-sm
                                            font-medium
                                        ">

                                            Attempt #
                                            {attempt.attempt_number}

                                        </p>

                                        <p className="
                                            mt-1
                                            text-xs
                                            text-zinc-500
                                        ">

                                            {attempt.action}

                                        </p>

                                    </div>


                                    <span className="
                                        text-xs
                                        text-zinc-400
                                    ">

                                        {attempt.result}

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}
function InfoBox({
    label,
    value
}) {

    return (
        <div className="
            rounded-xl
            bg-zinc-900
            p-4
        ">

            <p className="
                text-xs
                text-zinc-500
            ">
                {label}
            </p>

            <p className="
                mt-2
                text-sm
                font-medium
            ">
                {value}
            </p>

        </div>
    );
}function TimelineItem({ title, text, status }) {
    return (
        <div className="flex gap-4">
            
            <div className="mt-1 h-3 w-3 rounded-full bg-white shrink-0" />

            <div>
                <p className="text-sm font-medium">
                    {title}
                </p>
                {status && (
    <p className="
        mt-1
        text-xs
        text-zinc-500
        uppercase
    ">
        {status}
    </p>
)}

                <p className="mt-1 text-xs text-zinc-500">
                    {text}
                </p>
            </div>

        </div>
    );
}
function AnalyticsMetric({
    label,
    value
}) {

    return (

        <div className="
            rounded-xl
            bg-zinc-900
            p-5
        ">

            <p className="
                text-xs
                text-zinc-500
            ">
                {label}
            </p>

            <p className="
                mt-2
                text-2xl
                font-semibold
            ">
                {value}
            </p>

        </div>

    );

}
function LiveActivity({ events }) {

    return (
        <div className="
            mt-8
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
        ">

            <div className="flex items-center justify-between">

                <div>
                    <h2 className="text-lg font-bold">
                        Live AI Activity
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Real-time RecoverAI agent execution
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <span className="
                        h-2
                        w-2
                        rounded-full
                        bg-green-500
                    " />

                    <span className="text-xs text-green-500">
                        LIVE
                    </span>

                </div>

            </div>


            <div className="
                mt-6
                max-h-80
                overflow-y-auto
                space-y-3
            ">

                {events.length === 0 ? (

                    <p className="text-sm text-zinc-500">
                        Waiting for agent activity...
                    </p>

                ) : (

                    events.map((event, index) => (

                        <div
    key={`${event.timestamp}-${index}`}
    className="
        flex
        gap-3
        rounded-xl
        border
        border-zinc-900
        bg-zinc-900/50
        p-4
        transition-all
        duration-300
    "
>

    <div
        className={`
            mt-1
            h-2.5
            w-2.5
            rounded-full
            shrink-0
            ${
                event.status === "failed" ||
                event.status === "rejected"
                    ? "bg-red-500"
                    : event.status === "recovered"
                    ? "bg-green-500"
                    : "bg-white"
            }
        `}
    />

    <div className="min-w-0 flex-1">

        <div className="
            flex
            items-center
            justify-between
            gap-3
        ">

            <p className="
                text-sm
                font-medium
            ">
                {event.agent}
            </p>

            <span className="
                text-[10px]
                uppercase
                tracking-wider
                text-zinc-500
            ">
                {event.status}
            </span>

        </div>

        <p className="
            mt-1
            text-xs
            text-zinc-500
        ">
            {event.message}
        </p>

    </div>

</div>
                    ))

                )}

            </div>

        </div>
    );
}
export default App;