import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  Users, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Palette, 
  Star, 
  Lightbulb,
  X,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserContextFormProps {
  sessionId: string;
  onComplete: (contextId: string) => void;
  onSkip: () => void;
}

interface FormData {
  businessType: string;
  targetAudience: string;
  primaryGoal: string;
  specificChallenges: string[];
  designType: string;
  currentMetrics: {
    conversionRate?: number;
    bounceRate?: number;
    completionRate?: number;
  };
  admiredCompanies: string[];
  designConstraints: string[];
  brandGuidelines: {
    colorScheme?: string;
    designSystem?: string;
    accessibility?: string;
  };
}

const BUSINESS_TYPES = [
  { value: 'saas', label: 'SaaS Product', icon: Building2, description: 'Software as a Service platform' },
  { value: 'ecommerce', label: 'E-commerce', icon: BarChart3, description: 'Online retail store' },
  { value: 'marketplace', label: 'Marketplace', icon: Users, description: 'Multi-sided platform' },
  { value: 'content', label: 'Content Platform', icon: Palette, description: 'Media or publishing site' },
  { value: 'other', label: 'Other', icon: Lightbulb, description: 'Something else' }
];

const PRIMARY_GOALS = [
  { 
    value: 'increase-conversions', 
    label: 'Increase Conversions', 
    description: 'Turn more visitors into customers',
    icon: Target
  },
  { 
    value: 'improve-engagement', 
    label: 'Improve Engagement', 
    description: 'Keep users active and coming back',
    icon: Users
  },
  { 
    value: 'reduce-churn', 
    label: 'Reduce Churn', 
    description: 'Stop users from leaving',
    icon: ChevronLeft
  },
  { 
    value: 'simplify-ux', 
    label: 'Simplify UX', 
    description: 'Make it easier to use',
    icon: CheckSquare
  },
  { 
    value: 'other', 
    label: 'Other Goal', 
    description: 'Custom objective',
    icon: Star
  }
];

const DESIGN_TYPES = [
  { value: 'landing-page', label: 'Landing Page', description: 'Marketing or promotional page' },
  { value: 'dashboard', label: 'Dashboard', description: 'Data visualization interface' },
  { value: 'onboarding', label: 'Onboarding Flow', description: 'User registration/setup' },
  { value: 'checkout', label: 'Checkout Process', description: 'Payment and order flow' },
  { value: 'other', label: 'Other Design', description: 'Different type of interface' }
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
  'Poor conversion funnel',
  'Accessibility concerns',
  'Information overload',
  'Inconsistent design system'
];

export function UserContextForm({ sessionId, onComplete, onSkip }: UserContextFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    targetAudience: '',
    primaryGoal: '',
    specificChallenges: [],
    designType: '',
    currentMetrics: {},
    admiredCompanies: [],
    designConstraints: [],
    brandGuidelines: {}
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
    setFormData(prev => ({
      ...prev,
      specificChallenges: prev.specificChallenges.includes(challenge)
        ? prev.specificChallenges.filter(c => c !== challenge)
        : [...prev.specificChallenges, challenge]
    }));
  };

  const handleCompanyAdd = (company: string) => {
    if (company.trim() && !formData.admiredCompanies.includes(company.trim())) {
      setFormData(prev => ({
        ...prev,
        admiredCompanies: [...prev.admiredCompanies, company.trim()]
      }));
    }
  };

  const handleCompanyRemove = (company: string) => {
    setFormData(prev => ({
      ...prev,
      admiredCompanies: prev.admiredCompanies.filter(c => c !== company)
    }));
  };

  const handleConstraintAdd = (constraint: string) => {
    if (constraint.trim() && !formData.designConstraints.includes(constraint.trim())) {
      setFormData(prev => ({
        ...prev,
        designConstraints: [...prev.designConstraints, constraint.trim()]
      }));
    }
  };

  const handleConstraintRemove = (constraint: string) => {
    setFormData(prev => ({
      ...prev,
      designConstraints: prev.designConstraints.filter(c => c !== constraint)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('figmant_user_contexts')
        .insert({
          session_id: sessionId,
          business_type: formData.businessType as any,
          target_audience: formData.targetAudience,
          primary_goal: formData.primaryGoal as any,
          specific_challenges: formData.specificChallenges,
          design_type: formData.designType as any,
          current_metrics: formData.currentMetrics,
          admired_companies: formData.admiredCompanies,
          design_constraints: formData.designConstraints,
          brand_guidelines: formData.brandGuidelines
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Context saved successfully!');
      onComplete(data.id);
    } catch (error: any) {
      console.error('Error saving context:', error);
      toast.error('Failed to save context: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.businessType && formData.targetAudience && formData.primaryGoal;
      case 2:
        return formData.specificChallenges.length > 0;
      case 3:
        return formData.designType;
      case 4:
        return true; // Inspiration step is optional
      default:
        return false;
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Tell us about your project
              </h2>
              <p className="text-muted-foreground">
                Help us provide more targeted and actionable insights
              </p>
            </div>
            <Button variant="ghost" onClick={onSkip} className="flex items-center gap-2">
              <SkipForward className="w-4 h-4" />
              Skip for now
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Steps */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Business Context */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Business Context</h3>
                  <p className="text-muted-foreground">
                    Help us understand your business and primary objectives
                  </p>
                </div>

                {/* Business Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What type of business is this?</Label>
                  <RadioGroup 
                    value={formData.businessType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <div className="flex items-center space-x-3 flex-1">
                          <type.icon className="w-5 h-5 text-primary" />
                          <div>
                            <label htmlFor={type.value} className="font-medium cursor-pointer">
                              {type.label}
                            </label>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Target Audience */}
                <div className="space-y-3">
                  <Label htmlFor="target-audience" className="text-base font-medium">
                    Who is your target audience?
                  </Label>
                  <Textarea
                    id="target-audience"
                    placeholder="e.g., Small business owners, enterprise software teams, online shoppers..."
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                {/* Primary Goal */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What's your primary goal?</Label>
                  <RadioGroup 
                    value={formData.primaryGoal} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryGoal: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {PRIMARY_GOALS.map((goal) => (
                      <div key={goal.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={goal.value} id={goal.value} />
                        <div className="flex items-center space-x-3 flex-1">
                          <goal.icon className="w-5 h-5 text-primary" />
                          <div>
                            <label htmlFor={goal.value} className="font-medium cursor-pointer">
                              {goal.label}
                            </label>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* Step 2: Current Challenges */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Current Challenges</h3>
                  <p className="text-muted-foreground">
                    Select the UX issues you're currently facing
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COMMON_CHALLENGES.map((challenge, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer ${
                        formData.specificChallenges.includes(challenge)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleChallengeToggle(challenge)}
                    >
                      <Checkbox
                        checked={formData.specificChallenges.includes(challenge)}
                        onCheckedChange={() => handleChallengeToggle(challenge)}
                      />
                      <span className="text-sm font-medium">{challenge}</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Select all that apply. You can always add more details later.
                </div>
              </motion.div>
            )}

            {/* Step 3: Design Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Palette className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Design Details</h3>
                  <p className="text-muted-foreground">
                    Tell us about the specific design you're analyzing
                  </p>
                </div>

                {/* Design Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">What type of design is this?</Label>
                  <RadioGroup 
                    value={formData.designType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, designType: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {DESIGN_TYPES.map((type) => (
                      <div key={type.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <div className="flex-1">
                          <label htmlFor={type.value} className="font-medium cursor-pointer">
                            {type.label}
                          </label>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Current Metrics */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Current Performance Metrics (Optional)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="conversion-rate" className="text-sm">Conversion Rate (%)</Label>
                      <Input
                        id="conversion-rate"
                        type="number"
                        placeholder="e.g., 2.5"
                        value={formData.currentMetrics.conversionRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentMetrics: {
                            ...prev.currentMetrics,
                            conversionRate: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bounce-rate" className="text-sm">Bounce Rate (%)</Label>
                      <Input
                        id="bounce-rate"
                        type="number"
                        placeholder="e.g., 45"
                        value={formData.currentMetrics.bounceRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentMetrics: {
                            ...prev.currentMetrics,
                            bounceRate: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="completion-rate" className="text-sm">Task Completion Rate (%)</Label>
                      <Input
                        id="completion-rate"
                        type="number"
                        placeholder="e.g., 78"
                        value={formData.currentMetrics.completionRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentMetrics: {
                            ...prev.currentMetrics,
                            completionRate: e.target.value ? parseFloat(e.target.value) : undefined
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Inspiration & Constraints */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Inspiration & Constraints</h3>
                  <p className="text-muted-foreground">
                    Share companies you admire and any design constraints
                  </p>
                </div>

                {/* Admired Companies */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Companies you admire (Optional)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Apple, Stripe, Airbnb..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCompanyAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {formData.admiredCompanies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.admiredCompanies.map((company, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{company}</span>
                            <button
                              onClick={() => handleCompanyRemove(company)}
                              className="text-primary hover:text-primary/70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Design Constraints */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Design Constraints (Optional)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Must be accessible, Brand colors only, Mobile-first..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleConstraintAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {formData.designConstraints.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.designConstraints.map((constraint, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-secondary/50 border rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{constraint}</span>
                            <button
                              onClick={() => handleConstraintRemove(constraint)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Guidelines */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional context about your brand, design system, or specific requirements..."
                    value={formData.brandGuidelines.designSystem || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      brandGuidelines: {
                        ...prev.brandGuidelines,
                        designSystem: e.target.value
                      }
                    }))}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Complete & Analyze'}
                <Target className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}