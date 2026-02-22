"use client";

/**
 * Parsed CTO/Business Strategy output from the Strategist agent.
 * Renders structured cards instead of raw JSON.
 */
export interface CTOStrategyData {
  enhanced_idea: {
    problem: string;
    target_user: string;
    core_features: string[];
  };
  market_analysis: {
    competitors: string[];
    market_gap: string;
  };
  business_model: {
    revenue_streams: string[];
    pricing_strategy: string;
    cost_structure: string[];
  };
  risk_analysis: {
    technical_risk: string;
    market_risk: string;
    regulatory_risk: string;
  };
  architecture: {
    frontend: string;
    backend: string;
    database: string;
    justification: string;
  };
  feasibility_score: number;
}

const CTO_REQUIRED_KEYS: (keyof CTOStrategyData)[] = [
  "enhanced_idea",
  "market_analysis",
  "business_model",
  "risk_analysis",
  "architecture",
  "feasibility_score",
];

export function parseCTOStrategy(raw: string | null | undefined): CTOStrategyData | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const key of CTO_REQUIRED_KEYS) {
      if (!(key in parsed)) return null;
    }
    const score = Number((parsed as CTOStrategyData).feasibility_score);
    if (Number.isNaN(score) || score < 0 || score > 100) return null;
    return parsed as CTOStrategyData;
  } catch {
    return null;
  }
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return (
    <div className={`cto-card ${className}`.trim()} aria-labelledby={id}>
      <h3 id={id} className="cto-card__title">{title}</h3>
      <div className="cto-card__body">{children}</div>
    </div>
  );
}

function ListItems({ items }: { items: string[] }) {
  if (!items?.length) return <span className="cto-card__muted">—</span>;
  return (
    <ul className="cto-card__list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function FeasibilityMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const tier = pct >= 70 ? "high" : pct >= 40 ? "mid" : "low";
  return (
    <div className="cto-feasibility" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Feasibility score">
      <div className="cto-feasibility__bar-wrap">
        <div
          className={`cto-feasibility__bar cto-feasibility__bar--${tier}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="cto-feasibility__label">{pct} / 100</span>
    </div>
  );
}

type Props = {
  /** Raw enhanced_idea string (JSON or plain text). */
  enhancedIdea: string | null | undefined;
  /** Shown when no content. */
  emptyMessage?: string;
};

export default function CTOStrategyView({ enhancedIdea, emptyMessage = "Run the pipeline to generate an enhanced idea." }: Props) {
  const cto = parseCTOStrategy(enhancedIdea);

  if (!enhancedIdea || !enhancedIdea.trim()) {
    return <p className="enhanced-idea__empty">{emptyMessage}</p>;
  }

  if (!cto) {
    return (
      <pre className="enhanced-idea__text">
        {enhancedIdea}
      </pre>
    );
  }

  const { enhanced_idea, market_analysis, business_model, risk_analysis, architecture, feasibility_score } = cto;

  return (
    <div className="cto-strategy">
      <div className="cto-strategy__grid">
        <Card title="Enhanced idea">
          <p className="cto-card__p"><strong>Problem:</strong> {enhanced_idea.problem || "—"}</p>
          <p className="cto-card__p"><strong>Target user:</strong> {enhanced_idea.target_user || "—"}</p>
          <p className="cto-card__p"><strong>Core features:</strong></p>
          <ListItems items={enhanced_idea.core_features} />
        </Card>

        <Card title="Market analysis">
          <p className="cto-card__p"><strong>Market gap:</strong> {market_analysis.market_gap || "—"}</p>
          <p className="cto-card__p"><strong>Competitors:</strong></p>
          <ListItems items={market_analysis.competitors} />
        </Card>

        <Card title="Business model">
          <p className="cto-card__p"><strong>Pricing:</strong> {business_model.pricing_strategy || "—"}</p>
          <p className="cto-card__p"><strong>Revenue streams:</strong></p>
          <ListItems items={business_model.revenue_streams} />
          <p className="cto-card__p"><strong>Cost structure:</strong></p>
          <ListItems items={business_model.cost_structure} />
        </Card>

        <Card title="Risk">
          <p className="cto-card__p"><strong>Technical:</strong> {risk_analysis.technical_risk || "—"}</p>
          <p className="cto-card__p"><strong>Market:</strong> {risk_analysis.market_risk || "—"}</p>
          <p className="cto-card__p"><strong>Regulatory:</strong> {risk_analysis.regulatory_risk || "—"}</p>
        </Card>

        <Card title="Architecture">
          <p className="cto-card__p">
            <strong>Stack:</strong> {architecture.frontend} · {architecture.backend} · {architecture.database}
          </p>
          <p className="cto-card__p"><strong>Justification:</strong> {architecture.justification || "—"}</p>
        </Card>

        <Card title="Feasibility">
          <FeasibilityMeter score={feasibility_score} />
        </Card>
      </div>
    </div>
  );
}
