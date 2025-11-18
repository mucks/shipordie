'use client';

const steps = [
  {
    icon: '🎯',
    title: "Create a Market",
    description: "Define a milestone, set a deadline, and choose proof criteria. Launch markets for product releases, user growth, fundraising, or any verifiable achievement.",
    color: "primary"
  },
  {
    icon: '💰',
    title: "Place Your Bets",
    description: "Buy YES or NO shares based on your conviction. Prices update with sentiment. Early positions earn more.",
    color: "accent"
  },
  {
    icon: '🏆',
    title: "Verify & Settle (On-Chain)",
    description: "When the deadline hits, proof is submitted and verified. Smart contracts settle payouts automatically. Founders build reputation by shipping on time.",
    color: "destructive"
  }
];

export default function HowItWorks() {
  return (
    <section className="container mx-auto px-6 py-24">
      <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
        How It Works
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => {
          const bgColor = step.color === 'primary' ? 'bg-primary' :
                         step.color === 'accent' ? 'bg-accent' :
                         'bg-destructive';
          const shadowClass = step.color === 'primary' ? 'brutalist-shadow-primary' :
                             step.color === 'accent' ? 'brutalist-shadow-accent' :
                             'brutalist-shadow-destructive';
          
          return (
            <div 
              key={index}
              className={`bg-card border-4 border-black ${shadowClass} p-8 space-y-4`}
              data-testid={`card-step-${index + 1}`}
            >
              <div className={`${bgColor} border-4 border-black w-16 h-16 flex items-center justify-center text-3xl`}>
                {step.icon}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-muted-foreground/20">
                    {index + 1}
                  </span>
                  <h3 className="text-2xl font-bold flex-1" data-testid="text-step-title">
                    {step.title}
                  </h3>
                </div>
                
                <p className="text-muted-foreground font-medium leading-relaxed" data-testid="text-step-description">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

