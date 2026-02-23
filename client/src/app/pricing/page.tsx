import React from 'react';
import { Metadata } from 'next';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing | ReadyForms',
  description: 'Explore our flexible pricing plans designed to fit your needs - from free personal usage to enterprise solutions.',
};

interface PricingTierProps {
  name: string;
  description: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonLink: string;
  badge?: string;
}

function PricingTier({
  name,
  description,
  price,
  features,
  highlighted = false,
  buttonText,
  buttonLink,
  badge
}: PricingTierProps) {
  return (
    <Card className={`flex flex-col relative ${highlighted ? 'border-primary shadow-lg md:scale-105' : ''}`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="px-3 py-1">{badge}</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {price !== 'Free' && price !== 'Custom' && <span className="text-muted-foreground ml-1">/month</span>}
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className="w-full" 
          variant={highlighted ? "default" : "outline"}
        >
          <Link href={buttonLink}>
            {buttonText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 md:py-16">
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          AI-Powered Plans
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Transparent Pricing</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. Every plan includes AI-powered form generation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <PricingTier
          name="Free"
          description="Perfect for personal use and small projects"
          price="Free"
          features={[
            "Up to 5 forms",
            "100 responses per month",
            "3 AI generations/month",
            "Basic templates",
            "Essential form elements",
            "Export to CSV",
            "Email notifications"
          ]}
          buttonText="Get Started"
          buttonLink="/auth/register"
        />
        <PricingTier
          name="Pro"
          description="For professionals and growing teams"
          price="$12"
          highlighted={true}
          badge="Most Popular"
          features={[
            "Unlimited forms",
            "5,000 responses per month",
            "Unlimited AI generations",
            "Advanced templates",
            "Custom branding",
            "Advanced analytics",
            "Priority support",
            "Collaboration tools",
            "AI form improvement suggestions"
          ]}
          buttonText="Try Pro Free"
          buttonLink="/auth/register?plan=pro"
        />
        <PricingTier
          name="Enterprise"
          description="Custom solutions for large organizations"
          price="Custom"
          features={[
            "Unlimited forms & responses",
            "Custom AI models",
            "SSO & advanced security",
            "Dedicated support",
            "SLA guarantees",
            "Custom integrations",
            "Advanced user management",
            "On-premise deployment options",
            "Custom AI training on your data"
          ]}
          buttonText="Contact Sales"
          buttonLink="/contact-sales"
        />
      </div>
      
      <div className="mt-20 text-center">
        <h2 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto text-left grid gap-4">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">Yes, you can upgrade, downgrade, or cancel your plan at any time.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">What counts as an AI generation?</h3>
            <p className="text-muted-foreground">Each time you use the AI to generate or improve a form counts as one generation. Free plans include 3 per month, while Pro plans offer unlimited generations.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">What happens if I exceed my monthly response limit?</h3>
            <p className="text-muted-foreground">You'll receive a notification when approaching your limit. You can upgrade your plan to increase the limit or wait until the next billing cycle.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Is there a free trial for paid plans?</h3>
            <p className="text-muted-foreground">Yes, all paid plans come with a 14-day free trial with no credit card required.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Do you offer discounts for nonprofits or educational institutions?</h3>
            <p className="text-muted-foreground">Yes, we offer special pricing for eligible organizations. Please contact our sales team for details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}