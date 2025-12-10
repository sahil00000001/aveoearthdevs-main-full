import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vendorConciergeService } from '@/services/vendorConciergeService';
import { useVendorAuth } from '@/hooks/useVendorAuth';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Upload, 
  Building, 
  Leaf, 
  Target, 
  Lightbulb,
  AlertCircle,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
  estimatedTime: string;
}

interface OnboardingTask {
  id: string;
  stepId: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  type: 'form' | 'upload' | 'verification' | 'setup';
}

const VendorOnboardingAssistant = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const { vendor, isAuthenticated } = useVendorAuth();

  useEffect(() => {
    if (isAuthenticated() && vendor?.id) {
      initializeOnboarding();
    }
  }, [isAuthenticated, vendor]);

  const initializeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Initialize onboarding steps
      const initialSteps: OnboardingStep[] = [
        {
          id: 'business-info',
          title: 'Business Information',
          description: 'Set up your business profile and legal information',
          icon: Building,
          completed: false,
          required: true,
          estimatedTime: '10 minutes'
        },
        {
          id: 'verification',
          title: 'Identity Verification',
          description: 'Upload required documents for verification',
          icon: FileText,
          completed: false,
          required: true,
          estimatedTime: '15 minutes'
        },
        {
          id: 'sustainability',
          title: 'Sustainability Profile',
          description: 'Set up your environmental impact and certifications',
          icon: Leaf,
          completed: false,
          required: true,
          estimatedTime: '20 minutes'
        },
        {
          id: 'product-setup',
          title: 'Product Catalog',
          description: 'Add your first products to the marketplace',
          icon: Target,
          completed: false,
          required: true,
          estimatedTime: '30 minutes'
        },
        {
          id: 'optimization',
          title: 'AI Optimization',
          description: 'Let AI help optimize your store and products',
          icon: Sparkles,
          completed: false,
          required: false,
          estimatedTime: '15 minutes'
        }
      ];

      // Initialize tasks
      const initialTasks: OnboardingTask[] = [
        // Business Information Tasks
        {
          id: 'business-name',
          stepId: 'business-info',
          title: 'Business Name & Legal Entity',
          description: 'Enter your business name and legal entity type',
          completed: false,
          required: true,
          type: 'form'
        },
        {
          id: 'business-address',
          stepId: 'business-info',
          title: 'Business Address',
          description: 'Provide your business address and contact information',
          completed: false,
          required: true,
          type: 'form'
        },
        {
          id: 'tax-info',
          stepId: 'business-info',
          title: 'Tax Information',
          description: 'Enter PAN/GST number and tax details',
          completed: false,
          required: true,
          type: 'form'
        },
        {
          id: 'banking-info',
          stepId: 'business-info',
          title: 'Banking Information',
          description: 'Set up payment and banking details',
          completed: false,
          required: true,
          type: 'form'
        },
        // Verification Tasks
        {
          id: 'pan-upload',
          stepId: 'verification',
          title: 'PAN Card Upload',
          description: 'Upload your PAN card for verification',
          completed: false,
          required: true,
          type: 'upload'
        },
        {
          id: 'gst-upload',
          stepId: 'verification',
          title: 'GST Certificate Upload',
          description: 'Upload your GST registration certificate',
          completed: false,
          required: true,
          type: 'upload'
        },
        {
          id: 'bank-statement',
          stepId: 'verification',
          title: 'Bank Statement Upload',
          description: 'Upload recent bank statement for verification',
          completed: false,
          required: true,
          type: 'upload'
        },
        // Sustainability Tasks
        {
          id: 'sustainability-practices',
          stepId: 'sustainability',
          title: 'Sustainability Practices',
          description: 'Describe your environmental practices and initiatives',
          completed: false,
          required: true,
          type: 'form'
        },
        {
          id: 'certifications',
          stepId: 'sustainability',
          title: 'Environmental Certifications',
          description: 'Upload any environmental certifications you have',
          completed: false,
          required: false,
          type: 'upload'
        },
        // Product Setup Tasks
        {
          id: 'first-product',
          stepId: 'product-setup',
          title: 'Add First Product',
          description: 'Create your first product listing',
          completed: false,
          required: true,
          type: 'form'
        },
        {
          id: 'product-images',
          stepId: 'product-setup',
          title: 'Product Images',
          description: 'Upload high-quality product images',
          completed: false,
          required: true,
          type: 'upload'
        },
        {
          id: 'pricing-setup',
          stepId: 'product-setup',
          title: 'Pricing Strategy',
          description: 'Set up competitive pricing for your products',
          completed: false,
          required: true,
          type: 'form'
        }
      ];

      setSteps(initialSteps);
      setTasks(initialTasks);
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepTasks = () => {
    if (steps.length === 0) return [];
    const currentStepId = steps[currentStep].id;
    return tasks.filter(task => task.stepId === currentStepId);
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getStepCompletionPercentage = (stepId: string) => {
    const stepTasks = tasks.filter(task => task.stepId === stepId);
    if (stepTasks.length === 0) return 0;
    const completedStepTasks = stepTasks.filter(task => task.completed).length;
    return Math.round((completedStepTasks / stepTasks.length) * 100);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getAIInsights = async () => {
    try {
      setShowAIInsights(true);
      // This would call the AI service for onboarding insights
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const currentStepTasks = getCurrentStepTasks();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-green-600" />
                <span>Vendor Onboarding Assistant</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Let AI guide you through setting up your vendor account
              </p>
            </div>
            <Button 
              onClick={getAIInsights}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
            </div>
            <Progress value={completionPercentage} className="w-full h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepCompletion = getStepCompletionPercentage(step.id);
              const isActive = index === currentStep;
              const isCompleted = stepCompletion === 100;
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : isActive 
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.estimatedTime}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <currentStepData.icon className="h-5 w-5 text-blue-600" />
            <span>{currentStepData.title}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">{currentStepData.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStepTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label 
                      htmlFor={task.id}
                      className={`font-medium text-sm ${
                        task.completed ? 'text-green-600 line-through' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </label>
                    {task.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                  
                  {/* Task-specific content */}
                  {task.type === 'form' && !task.completed && (
                    <div className="mt-3 space-y-3">
                      {task.id === 'business-name' && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="Business Name" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Legal Entity Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="private-limited">Private Limited</SelectItem>
                              <SelectItem value="llp">LLP</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {task.id === 'business-address' && (
                        <Textarea placeholder="Business Address" rows={3} />
                      )}
                      {task.id === 'tax-info' && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="PAN Number" />
                          <Input placeholder="GST Number" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {task.type === 'upload' && !task.completed && (
                    <div className="mt-3">
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Estimated time: {currentStepData.estimatedTime}
          </span>
        </div>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="bg-green-600 hover:bg-green-700"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>AI Onboarding Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Optimization Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete business verification first to unlock all features</li>
                    <li>• Upload high-quality product images for better conversion</li>
                    <li>• Set up sustainability practices to improve your eco-score</li>
                    <li>• Use AI recommendations to optimize your product listings</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Next Steps</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Focus on completing required tasks first</li>
                    <li>• Consider adding environmental certifications</li>
                    <li>• Set up competitive pricing strategy</li>
                    <li>• Enable AI-powered product optimization</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setShowAIInsights(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Got it!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorOnboardingAssistant;
