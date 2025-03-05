'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: string;
  created_at: string;
  user: {
    email: string;
    full_name: string;
  };
  registration: {
    event: {
      title: string;
    };
  };
}

interface Refund {
  id: string;
  amount: number;
  status: string;
  reason: string;
  created_at: string;
  transaction: {
    reference: string;
    user: {
      email: string;
    };
  };
}

interface Dispute {
  id: string;
  status: string;
  reason: string;
  created_at: string;
  user: {
    email: string;
    full_name: string;
  };
  transaction: {
    reference: string;
    amount: number;
  };
}

interface Analytics {
  total_revenue: number;
  total_transactions: number;
  total_refunds: number;
  total_disputes: number;
  recent_transactions: {
    date: string;
    amount: number;
  }[];
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    try {
      setLoading(true);

      if (activeTab === 'transactions' || activeTab === 'analytics') {
        const { data: transData, error: transError } = await supabase
          .from('payment_transactions')
          .select(`
            *,
            user:users (email, full_name),
            registration:registrations (
              event:events (title)
            )
          `)
          .order('created_at', { ascending: false });

        if (transError) throw transError;
        setTransactions(transData || []);

        if (activeTab === 'analytics') {
          // Calculate analytics
          const analytics = {
            total_revenue: transData?.reduce((sum, t) => 
              t.status === 'completed' ? sum + t.amount : sum, 0) || 0,
            total_transactions: transData?.length || 0,
            total_refunds: 0,
            total_disputes: 0,
            recent_transactions: transData?.slice(0, 7).map(t => ({
              date: format(new Date(t.created_at), 'yyyy-MM-dd'),
              amount: t.amount
            })) || []
          };
          setAnalytics(analytics);
        }
      }

      if (activeTab === 'refunds') {
        const { data: refundData, error: refundError } = await supabase
          .from('payment_refunds')
          .select(`
            *,
            transaction:payment_transactions (
              reference,
              user:users (email)
            )
          `)
          .order('created_at', { ascending: false });

        if (refundError) throw refundError;
        setRefunds(refundData || []);
      }

      if (activeTab === 'disputes') {
        const { data: disputeData, error: disputeError } = await supabase
          .from('payment_disputes')
          .select(`
            *,
            user:users (email, full_name),
            transaction:payment_transactions (reference, amount)
          `)
          .order('created_at', { ascending: false });

        if (disputeError) throw disputeError;
        setDisputes(disputeData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefund() {
    if (!selectedTransaction || !refundAmount || !refundReason) return;

    try {
      setProcessingRefund(true);

      // Create refund record
      const refundReference = `REF-${Math.random().toString(36).substring(2, 15)}`;
      const { error: refundError } = await supabase
        .from('payment_refunds')
        .insert({
          transaction_id: selectedTransaction.id,
          amount: parseFloat(refundAmount),
          reason: refundReason,
          refund_reference: refundReference,
          status: 'pending'
        });

      if (refundError) throw refundError;

      // Update transaction status
      const { error: transError } = await supabase
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('id', selectedTransaction.id);

      if (transError) throw transError;

      toast.success('Refund initiated successfully');
      setShowRefundDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  }

  async function handleDisputeResolution(disputeId: string, resolution: string) {
    try {
      const { error } = await supabase
        .from('payment_disputes')
        .update({
          status: 'resolved',
          resolution,
          resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      if (error) throw error;
      toast.success('Dispute resolved successfully');
      fetchData();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage transactions, refunds, and disputes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View and manage payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{transaction.registration.event.title}</p>
                      <p className="text-sm text-gray-500">{transaction.user.email}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.created_at), 'PPP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{transaction.amount.toLocaleString()}</p>
                      <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                      {transaction.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowRefundDialog(true);
                          }}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <CardDescription>
                Manage refund requests and process refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Transaction: {refund.transaction.reference}</p>
                      <p className="text-sm text-gray-500">{refund.transaction.user.email}</p>
                      <p className="text-sm text-gray-500">Reason: {refund.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{refund.amount.toLocaleString()}</p>
                      <div className="mt-1">{getStatusBadge(refund.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Payment Disputes</CardTitle>
              <CardDescription>
                Handle and resolve payment disputes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{dispute.user.full_name}</p>
                      <p className="text-sm text-gray-500">
                        Transaction: {dispute.transaction.reference}
                      </p>
                      <p className="text-sm text-gray-500">Reason: {dispute.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₦{dispute.transaction.amount.toLocaleString()}
                      </p>
                      <div className="mt-1">{getStatusBadge(dispute.status)}</div>
                      {dispute.status === 'open' && (
                        <div className="mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisputeResolution(dispute.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisputeResolution(dispute.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <BanknotesIcon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{analytics?.total_revenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <ArrowPathIcon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total_transactions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Refunds
                </CardTitle>
                <ChartBarIcon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total_refunds}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Disputes
                </CardTitle>
                <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total_disputes}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Enter the refund amount and reason
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Transaction Reference</label>
              <p className="mt-1">{selectedTransaction?.reference}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Original Amount</label>
              <p className="mt-1">₦{selectedTransaction?.amount.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Refund Amount</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefundAmount(e.target.value)}
                max={selectedTransaction?.amount}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason for Refund</label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={processingRefund || !refundAmount || !refundReason}
            >
              {processingRefund ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
