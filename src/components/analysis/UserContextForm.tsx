import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  ShoppingCart, 
  Users, 
  FileText, 
  Briefcase, 
  Target, 
  TrendingUp, 
  UserCheck, 
  Zap,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS Product', icon: Cloud, description: 'Software as a Service platform' },
  { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, description: 'Online store or marketplace' },
  { value: 'marketplace', label: 'Marketplace', icon: Users, description: 'Platform connecting buyers & sellers' },
  { value: 'content', label: 'Content Platform', icon: FileText, description: 'Blog, media, or publishing site' },
  { value: 'other', label: 'Other', icon: Briefcase, description: 'Something else entirely' }
];

const PRIMARY_GOALS = [
  { 
    value: 'increase-conversions', 
    label: 'Increase Conversions', 
    icon: Target,
    description: 'Turn more visitors into customers' 
  },
  { 
    value: 'improve-engagement', 
    label: 'Improve Engagement', 
    icon: TrendingUp,
    description: 'Keep users active and coming back' 
  },
  { 
    value: 'reduce-churn', 
    label: 'Reduce Churn', 
    icon: UserCheck,
    description: 'Stop users from leaving' 
  },
  { 
    value: 'simplify-ux', 
    label: 'Simplify UX', 
    icon: Zap,
    description: 'Make it easier to use' 
  },
  { 
    value: 'other', 
    label: 'Other Goal', 
    icon: Sparkles,
    description: 'Something specific to your needs' 
  }
];

const COMMON_CHALLENGES = [
  'Users don\'t understand our value proposition',
  'High bounce rate on landing page',
  'Complex onboarding process',
  'Low feature adoption',
  'Unclear navigation',
  'Mobile experience issues',
  'Slow page load times',
  'Confusing pricing structure',
  'Poor search functionality',
  'Lack of social proof',
  'Overwhelming interface',
  'Weak call-to-action buttons'
];

const DESIGN_TYPES = [
  { value: 'landing-page', label: 'Landing Page', description: 'Marketing or campaign page' },
  { value: 'dashboard', label: 'Dashboard', description: 'App interface or admin panel' },
  { value: 'onboarding', label: 'Onboarding', description: 'User signup or setup flow' },
  { value: 'checkout', label: 'Checkout', description: 'Purchase or payment flow' },
  { value: 'other', label: 'Other', description: 'Something else' }
];

interface UserContextFormProps {
  sessionId: string;
  onComplete: (contextId: string) => void;
  onSkip: () => void;
}

export function UserContextForm({ sessionId, onComplete, onSkip }: UserContextFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    targetAudience: '',
    primaryGoal: '',
    specificChallenges: [] as string[],
    designType: '',
    currentMetrics: {
      conversionRate: '',
      bounceRate: '',
      completionRate: ''
    },
    admiredCompanies: [] as string[],
    designConstraints: [] as string[],
    brandGuidelines: {
      colors: '',
      fonts: '',
      tone: ''
    }
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleChallengeToggle = (challenge: string) => {
    const updated = formData.specificChallenges.includes(challenge)
      ? formData.specificChallenges.filter(c => c !== challenge)
      : [...formData.specificChallenges, challenge];
    
    setFormData({ ...formData, specificChallenges: updated });
  };

  const handleCompanyAdd = (company: string) => {
    if (company.trim() && !formData.admiredCompanies.includes(company.trim())) {
      setFormData({
        ...formData,
        admiredCompanies: [...formData.admiredCompanies, company.trim()]
      });
    }
  };

  const handleCompanyRemove = (company: string) => {
    setFormData({
      ...formData,
      admiredCompanies: formData.admiredCompanies.filter(c => c !== company)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('figmant_user_contexts')
        .insert({
          session_id: sessionId,
          business_type: formData.businessType,
          target_audience: formData.targetAudience,
          primary_goal: formData.primaryGoal,
          specific_challenges: formData.specificChallenges,
          design_type: formData.designType,
          current_metrics: formData.currentMetrics,
          admired_companies: formData.admiredCompanies,
          design_constraints: formData.designConstraints,
          brand_guidelines: formData.brandGuidelines
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Context saved! This will help generate better insights.');
      onComplete(data.id);
    } catch (error) {
      console.error('Failed to save context:', error);
      toast.error('Failed to save context. Proceeding with analysis anyway.');
      onSkip();
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.businessType && formData.primaryGoal;
      case 2:
        return formData.specificChallenges.length > 0;
      case 3:
        return formData.designType;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-sm">
            Step {step} of {totalSteps}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Help us understand your goals
        </CardTitle>
        <CardDescription>
          This information helps our AI generate more targeted insights and solutions for your specific situation.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium mb-4 block">What type of business is this for?</Label>
                <div className="grid gap-3">
                  {BUSINESS_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, businessType: type.value })}
                        className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                          formData.businessType === type.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-base font-medium">
                  Who is your target audience?
                </Label>
                <Textarea
                  id="targetAudience"
                  placeholder="e.g., Small business owners, enterprise customers, content creators..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">What's your primary goal?</Label>
                <div className="grid gap-3">
                  {PRIMARY_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => setFormData({ ...formData, primaryGoal: goal.value })}
                        className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                          formData.primaryGoal === goal.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">{goal.label}</div>
                            <div className="text-sm text-muted-foreground">{goal.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium mb-4 block">
                  What challenges are you facing? (Select all that apply)
                </Label>
                <div className="grid gap-2">
                  {COMMON_CHALLENGES.map((challenge) => (
                    <label
                      key={challenge}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={formData.specificChallenges.includes(challenge)}
                        onCheckedChange={() => handleChallengeToggle(challenge)}
                        className="mt-0.5"
                      />
                      <span className="text-sm">{challenge}</span>
                    </label>
                  ))}
                </div>
                {formData.specificChallenges.length > 0 && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="text-sm font-medium mb-2">Selected challenges:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specificChallenges.map((challenge) => (
                        <Badge key={challenge} variant="secondary" className="text-xs">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium mb-4 block">What type of design are you analyzing?</Label>
                <div className="grid gap-3">
                  {DESIGN_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, designType: type.value })}
                      className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                        formData.designType === type.value
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Current metrics (if known)</Label>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="conversionRate" className="text-sm">Conversion Rate (%)</Label>
                    <Input
                      id="conversionRate"
                      type="number"
                      placeholder="e.g., 2.5"
                      value={formData.currentMetrics.conversionRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMetrics: { ...formData.currentMetrics, conversionRate: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bounceRate" className="text-sm">Bounce Rate (%)</Label>
                    <Input
                      id="bounceRate"
                      type="number"
                      placeholder="e.g., 65"
                      value={formData.currentMetrics.bounceRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMetrics: { ...formData.currentMetrics, bounceRate: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="completionRate" className="text-sm">Task Completion Rate (%)</Label>
                    <Input
                      id="completionRate"
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.currentMetrics.completionRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMetrics: { ...formData.currentMetrics, completionRate: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <Label className="text-base font-medium mb-4 block">
                  Companies you admire (for inspiration)
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Apple, Stripe, Notion..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCompanyAdd((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleCompanyAdd(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.admiredCompanies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.admiredCompanies.map((company) => (
                        <Badge
                          key={company}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleCompanyRemove(company)}
                        >
                          {company} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Brand guidelines (optional)</Label>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="colors" className="text-sm">Brand Colors</Label>
                    <Input
                      id="colors"
                      placeholder="e.g., Blue (#1E40AF), White, Gray"
                      value={formData.brandGuidelines.colors}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandGuidelines: { ...formData.brandGuidelines, colors: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tone" className="text-sm">Brand Tone</Label>
                    <Input
                      id="tone"
                      placeholder="e.g., Professional, Friendly, Modern"
                      value={formData.brandGuidelines.tone}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandGuidelines: { ...formData.brandGuidelines, tone: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? 'Saving...' : 'Start Analysis'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}