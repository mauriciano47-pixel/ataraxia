import React, { useState } from "react";
// import { Sparkles, Dumbbell, Wheat, PenLine, Orbit } from "lucide-react";
const Sparkles = () => null;
const Dumbbell = () => null;
const Wheat = () => null;
const PenLine = () => null;
const Orbit = () => null;

// Dirección 4: COSMOS — la técnica estoica de "ver desde arriba" (Marco Aurelio contemplando
// el universo para relativizar lo cotidiano). Azul noche profundo + azul eléctrico como energía/estrellas.
const C = {
    bg: "#0A0E17",
    card: "#121826",
    cardBorder: "#1E2A3F",
    ink: "#E7ECF7",
    inkDim: "#6B7690",
    electric: "#3D6BFF",
    electricSoft: "#3D6BFF33",
    white: "#FFFFFF",
};

function Label({ children, color }) {
    return <div className="text-[10px] uppercase" style={{ color: color || C.inkDim, letterSpacing: "0.2em" }}>{children}</div>;
}

// Signature: mapa de constelación — cada punto es una tarea/hábito, se conectan al completarse
function Constellation({ points, size = 140 }) {
    const coords = [
        [30, 100], [70, 40], [110, 60], [95, 110], [50, 125],
    ].slice(0, points.length);
    // const done = points.filter((p) => p).length;
    return (
        <svg width={size} height={size}>
            {coords.map((c, i) =>
                i < coords.length - 1 && points[i] && points[i + 1] ? (
                    <line key={`l-${i}`} x1={c[0]} y1={c[1]} x2={coords[i + 1][0]} y2={coords[i + 1][1]} stroke={C.electric} strokeWidth="1" opacity="0.6" />
                ) : null
            )}
            {coords.map((c, i) => (
                <circle
                    key={i}
                    cx={c[0]}
                    cy={c[1]}
                    r={points[i] ? 5 : 3}
                    fill={points[i] ? C.electric : C.cardBorder}
                    style={points[i] ? { filter: "drop-shadow(0 0 4px #3D6BFF)" } : {}}
                />
            ))}
        </svg>
    );
}

function HomeScreen() {
    const habitos = [true, true, true, false, false];
    return (
        <div className="flex flex-col gap-5 px-5 pt-8 pb-4">
            <div>
                <Label color={C.electric}>ATARAXIA</Label>
                <h1 className="text-xl mt-1" style={{ color: C.ink, fontFamily: "Georgia, serif" }}>
                    Visto desde arriba, todo pesa menos
                </h1>
            </div>

            <div className="flex justify-center py-2">
                <Constellation points={habitos} />
            </div>
            <div className="text-center text-xs -mt-2" style={{ color: C.inkDim }}>3 de 5 hábitos encendidos hoy</div>

            <div className="p-4 rounded" style={{ backgroundColor: C.card, border: `1px solid ${C.cardBorder}` }}>
                <p className="text-sm leading-relaxed italic" style={{ color: C.ink, fontFamily: "Georgia, serif" }}>
                    {'"Contempla a menudo el conjunto del tiempo y de la sustancia, y verás qué pequeño es cada cosa."'}
                </p>
                <div className="text-xs mt-2" style={{ color: C.electric }}>— Marco Aurelio</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded" style={{ backgroundColor: C.card, border: `1px solid ${C.cardBorder}` }}>
                    <Label>Entreno</Label>
                    <div className="text-lg mt-1" style={{ color: C.ink }}>4 / 6</div>
                </div>
                <div className="p-4 rounded" style={{ backgroundColor: C.card, border: `1px solid ${C.cardBorder}` }}>
                    <Label>Racha</Label>
                    <div className="text-lg mt-1" style={{ color: C.electric }}>27 días</div>
                </div>
            </div>
        </div>
    );
}

function EntrenoScreen() {
    const ejercicios = [
        { n: "Sentadilla", s: "4x8", done: true },
        { n: "Peso muerto", s: "3x6", done: true },
        { n: "Zancadas", s: "3x12", done: false },
    ];
    return (
        <div className="flex flex-col gap-3 px-5 pt-8 pb-4">
            <Label color={C.electric}>Hoy</Label>
            <h2 style={{ color: C.ink, fontFamily: "Georgia, serif" }} className="text-lg -mt-1 mb-1">Tren inferior</h2>
            {ejercicios.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: C.card, border: `1px solid ${C.cardBorder}` }}>
                    <div>
                        <div style={{ color: C.ink }} className="text-sm">{e.n}</div>
                        <div style={{ color: C.inkDim }} className="text-xs">{e.s}</div>
                    </div>
                    <div
                        className="w-5 h-5 rounded-full"
                        style={{
                            backgroundColor: e.done ? C.electric : "transparent",
                            border: `1px solid ${e.done ? C.electric : C.cardBorder}`,
                            boxShadow: e.done ? "0 0 6px #3D6BFF" : "none",
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

function NutricionScreen() {
    const macros = [
        { n: "Proteína", val: 98, goal: 160 },
        { n: "Carbohidratos", val: 180, goal: 220 },
        { n: "Grasas", val: 40, goal: 65 },
    ];
    return (
        <div className="flex flex-col gap-5 px-5 pt-8 pb-4">
            <Label color={C.electric}>Balance</Label>
            <h2 style={{ color: C.ink, fontFamily: "Georgia, serif" }} className="text-lg -mt-1 mb-1">Combustible del cuerpo</h2>
            {macros.map((m, i) => (
                <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: C.inkDim }}>
                        <span>{m.n}</span>
                        <span>{m.val}g / {m.goal}g</span>
                    </div>
                    <div className="h-1 w-full rounded-full" style={{ backgroundColor: C.cardBorder }}>
                        <div className="h-1 rounded-full" style={{ width: `${(m.val / m.goal) * 100}%`, backgroundColor: C.electric, boxShadow: "0 0 6px #3D6BFF" }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function App() {
    const [tab, setTab] = useState("home");
    const tabs = [
        { id: "home", icon: Sparkles, label: "Hoy" },
        { id: "entreno", icon: Dumbbell, label: "Entreno" },
        { id: "nutricion", icon: Wheat, label: "Nutrición" },
        { id: "diario", icon: PenLine, label: "Diario" },
        { id: "historial", icon: Orbit, label: "Historial" },
    ];
    const screens = { home: <HomeScreen />, entreno: <EntrenoScreen />, nutricion: <NutricionScreen />, diario: <HomeScreen />, historial: <HomeScreen /> };

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#04060B" }}>
            <div
                className="w-[380px] h-[760px] rounded-[2.5rem] overflow-hidden flex flex-col relative"
                style={{ backgroundColor: C.bg, border: "8px solid #000", boxShadow: "0 0 60px #3D6BFF22, 0 20px 60px rgba(0,0,0,0.6)" }}
            >
                <div className="w-24 h-5 bg-black rounded-b-2xl mx-auto z-10" />
                <div className="flex-1 overflow-y-auto" style={{ marginTop: "-1.25rem" }}>
                    {screens[tab]}
                </div>
                <div className="flex justify-around items-center py-3 px-2" style={{ backgroundColor: C.card, borderTop: `1px solid ${C.cardBorder}` }}>
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const active = tab === t.id;
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col items-center gap-1"
                                style={{ color: active ? C.electric : C.inkDim, opacity: active ? 1 : 0.7 }}>
                                <Icon size={18} />
                                <span className="text-[9px]">{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}