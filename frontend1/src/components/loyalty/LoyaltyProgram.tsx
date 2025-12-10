import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Star, 
  Gift, 
  Trophy, 
  Zap, 
  Leaf, 
  ShoppingBag,
  Heart,
  Share2,
  Download,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
  icon: React.ReactNode;
  discount: number;
  freeShipping: boolean;
  earlyAccess: boolean;
}

interface LoyaltyActivity {
  id: string;
  type: 'purchase' | 'review' | 'referral' | 'social_share' | 'sustainability_action';
  description: string;
  points: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'expired';
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  type: 'discount' | 'free_product' | 'free_shipping' | 'exclusive_access';
  value: number;
  available: boolean;
  image: string;
}

const LoyaltyProgram: React.FC<{ userId?: string }> = ({ userId }) => {
  const [currentPoints, setCurrentPoints] = useState(1250);
  const [currentTier, setCurrentTier] = useState('eco_warrior');
  const [activities, setActivities] = useState<LoyaltyActivity[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tiers: LoyaltyTier[] = [
    {
      id: 'eco_starter',
      name: 'Eco Starter',
      minPoints: 0,
      maxPoints: 499,
      color: 'bg-gray-100 text-gray-700',
      benefits: ['5% discount on sustainable products', 'Basic rewards'],
      icon: <Leaf className="h-5 w-5" />,
      discount: 5,
      freeShipping: false,
      earlyAccess: false
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      minPoints: 500,
      maxPoints: 1499,
      color: 'bg-green-100 text-green-700',
      benefits: ['10% discount', 'Free shipping on orders over $50', 'Exclusive eco tips'],
      icon: <Star className="h-5 w-5" />,
      discount: 10,
      freeShipping: true,
      earlyAccess: false
    },
    {
      id: 'eco_champion',
      name: 'Eco Champion',
      minPoints: 1500,
      maxPoints: 2999,
      color: 'bg-blue-100 text-blue-700',
      benefits: ['15% discount', 'Free shipping', 'Early access to new products', 'Monthly eco box'],
      icon: <Crown className="h-5 w-5" />,
      discount: 15,
      freeShipping: true,
      earlyAccess: true
    },
    {
      id: 'eco_legend',
      name: 'Eco Legend',
      minPoints: 3000,
      maxPoints: 999999,
      color: 'bg-purple-100 text-purple-700',
      benefits: ['20% discount', 'Free shipping', 'VIP support', 'Exclusive events', 'Personal eco consultant'],
      icon: <Trophy className="h-5 w-5" />,
      discount: 20,
      freeShipping: true,
      earlyAccess: true
    }
  ];

  const currentTierData = tiers.find(tier => tier.id === currentTier) || tiers[0];
  const nextTier = tiers.find(tier => tier.minPoints > currentPoints) || tiers[tiers.length - 1];
  const progressToNext = nextTier ? ((currentPoints - currentTierData.minPoints) / (nextTier.minPoints - currentTierData.minPoints)) * 100 : 100;

  useEffect(() => {
    loadLoyaltyData();
  }, [userId]);

  const loadLoyaltyData = async () => {
    setIsLoading(true);
    try {
      // Fetch real loyalty data from Supabase
      const { supabase } = await import('@/lib/supabase');
      
      // Fetch user's loyalty activities
      const { data: activities, error: activitiesError } = await supabase
        .from('loyalty_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching loyalty activities:', activitiesError);
        setActivities([]);
      } else {
        setActivities(activities || []);
      }

      // Fetch available rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('active', true)
        .order('points_required', { ascending: true });

      if (rewardsError) {
        console.error('Error fetching loyalty rewards:', rewardsError);
        setRewards([]);
      } else {
        setRewards(rewards || []);
      }

      // Fetch user's current points
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user points:', userError);
      } else {
        setCurrentPoints(userData?.loyalty_points || 0);
      }

    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const earnPoints = async (activity: Omit<LoyaltyActivity, 'id' | 'timestamp' | 'status'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newActivity: LoyaltyActivity = {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'completed'
      };

      setActivities(prev => [newActivity, ...prev]);
      setCurrentPoints(prev => prev + activity.points);

      // Check for tier upgrade
      const newTier = tiers.find(tier => 
        prev + activity.points >= tier.minPoints && 
        prev + activity.points < tier.maxPoints
      );
      
      if (newTier && newTier.id !== currentTier) {
        setCurrentTier(newTier.id);
      }
    } catch (error) {
      console.error('Error earning points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !reward.available || currentPoints < reward.pointsRequired) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentPoints(prev => prev - reward.pointsRequired);
      
      // Update reward availability
      setRewards(prev => prev.map(r => 
        r.id === rewardId ? { ...r, available: false } : r
      ));
    } catch (error) {
      console.error('Error redeeming reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-[hsl(var(--forest-deep))] mx-auto mb-4" />
          <p>Loading loyalty program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            Your Loyalty Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${currentTierData.color}`}>
                {currentTierData.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentTierData.name}</h3>
                <p className="text-gray-600">{currentPoints} points</p>
              </div>
            </div>
            <Badge className={`${currentTierData.color} text-lg px-4 py-2`}>
              {currentTierData.discount}% OFF
            </Badge>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && nextTier.id !== currentTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{nextTier.minPoints - currentPoints} points to go</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}

          {/* Current Benefits */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Your Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {currentTierData.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ways to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ways to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <ShoppingBag className="h-8 w-8 text-[hsl(var(--forest-deep))]" />
              <div className="flex-1">
                <h4 className="font-medium">Make a Purchase</h4>
                <p className="text-sm text-gray-600">1 point per $1 spent</p>
              </div>
              <Badge className="bg-green-100 text-green-700">+1/$</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="flex-1">
                <h4 className="font-medium">Write a Review</h4>
                <p className="text-sm text-gray-600">25 points per review</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">+25</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Share2 className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <h4 className="font-medium">Share on Social</h4>
                <p className="text-sm text-gray-600">15 points per share</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">+15</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="flex-1">
                <h4 className="font-medium">Refer a Friend</h4>
                <p className="text-sm text-gray-600">100 points per referral</p>
              </div>
              <Badge className="bg-red-100 text-red-700">+100</Badge>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => earnPoints({ type: 'review', description: 'Product review', points: 25 })}
              variant="outline"
              size="sm"
            >
              <Star className="h-4 w-4 mr-2" />
              Write Review
            </Button>
            <Button 
              onClick={() => earnPoints({ type: 'social_share', description: 'Social share', points: 15 })}
              variant="outline"
              size="sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{reward.pointsRequired} pts</span>
                  </div>
                  <Badge 
                    variant={reward.available ? "default" : "secondary"}
                    className={reward.available ? "bg-green-100 text-green-700" : ""}
                  >
                    {reward.available ? "Available" : "Redeemed"}
                  </Badge>
                </div>

                <Button
                  onClick={() => redeemReward(reward.id)}
                  disabled={!reward.available || currentPoints < reward.pointsRequired}
                  className="w-full"
                  size="sm"
                >
                  {currentPoints < reward.pointsRequired 
                    ? `Need ${reward.pointsRequired - currentPoints} more points`
                    : 'Redeem Reward'
                  }
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[hsl(var(--forest-deep))]/10 rounded-full">
                    {activity.type === 'purchase' && <ShoppingBag className="h-4 w-4 text-[hsl(var(--forest-deep))]" />}
                    {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-500" />}
                    {activity.type === 'referral' && <Heart className="h-4 w-4 text-red-500" />}
                    {activity.type === 'social_share' && <Share2 className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'sustainability_action' && <Leaf className="h-4 w-4 text-green-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700">
                    +{activity.points} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyProgram;


