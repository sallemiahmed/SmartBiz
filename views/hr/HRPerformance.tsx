
import React, { useState } from 'react';
import { 
  Star, BarChart3, Calendar, CheckCircle, 
  Plus, Search, Flag, MessageSquare, Award, TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { PerformanceReview, ReviewCycle } from '../../types';

// Internal Mock Data
const MOCK_CYCLES: ReviewCycle[] = [
  { id: 'c1', name: 'Q1 2024 Performance Review', startDate: '2024-01-01', endDate: '2024-03-31', status: 'closed' },
  { id: 'c2', name: 'Q2 2024 Performance Review', startDate: '2024-04-01', endDate: '2024-06-30', status: 'active' },
];

const MOCK_REVIEWS: PerformanceReview[] = [
  { 
    id: 'r1', employeeId: 'e4', employeeName: 'Karim Jaziri', 
    cycleId: 'c1', cycleName: 'Q1 2024 Performance Review',
    date: '2024-03-25', reviewerName: 'Mohamed Ben Ali',
    status: 'completed', score: 4.2,
    ratings: [
      { category: 'Technical Skills', score: 4 },
      { category: 'Communication', score: 4 },
      { category: 'Teamwork', score: 5 },
      { category: 'Reliability', score: 4 }
    ],
    overallFeedback: 'Excellent quarter, showed great leadership in the new project.'
  },
  { 
    id: 'r2', employeeId: 'e3', employeeName: 'Walid Jlassi', 
    cycleId: 'c1', cycleName: 'Q1 2024 Performance Review',
    date: '2024-03-26', reviewerName: 'Mohamed Ben Ali',
    status: 'completed', score: 3.8,
    ratings: [
      { category: 'Technical Skills', score: 3 },
      { category: 'Communication', score: 4 },
      { category: 'Teamwork', score: 4 },
      { category: 'Reliability', score: 4 }
    ],
    overallFeedback: 'Good performance, needs to improve technical knowledge on new fleet systems.'
  },
  { 
    id: 'r3', employeeId: 'e2', employeeName: 'Sarra Trabelsi', 
    cycleId: 'c2', cycleName: 'Q2 2024 Performance Review',
    date: '2024-06-15', reviewerName: 'Mohamed Ben Ali',
    status: 'scheduled', score: 0,
    ratings: [],
    overallFeedback: ''
  }
];

const HRPerformance: React.FC = () => {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews'>('dashboard');
  const [reviews, setReviews] = useState<PerformanceReview[]>(MOCK_REVIEWS);
  const [cycles] = useState<ReviewCycle[]>(MOCK_CYCLES);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    technical: number;
    communication: number;
    teamwork: number;
    reliability: number;
    feedback: string;
  }>({ technical: 0, communication: 0, teamwork: 0, reliability: 0, feedback: '' });

  const completedReviews = reviews.filter(r => r.status === 'completed');
  const avgScore = completedReviews.length > 0 
    ? (completedReviews.reduce((acc, r) => acc + r.score, 0) / completedReviews.length).toFixed(1) 
    : '0.0';
  
  const topPerformer = completedReviews.sort((a, b) => b.score - a.score)[0];
  
  const reviewsByStatus = [
    { name: 'Completed', value: completedReviews.length, color: '#10b981' },
    { name: 'Scheduled', value: reviews.filter(r => r.status === 'scheduled').length, color: '#f59e0b' },
    { name: 'In Progress', value: reviews.filter(r => r.status === 'in_progress').length, color: '#3b82f6' }
  ];

  const performanceTrend = [
    { name: 'Q3 2023', score: 3.8 },
    { name: 'Q4 2023', score: 3.9 },
    { name: 'Q1 2024', score: 4.0 },
    { name: 'Q2 2024', score: Number(avgScore) }
  ];

  const handleOpenReview = (review: PerformanceReview) => {
    setSelectedReview(review);
    if(review.status === 'completed') {
      const getScore = (cat: string) => review.ratings.find(r => r.category === cat)?.score || 0;
      setReviewForm({
        technical: getScore('Technical Skills'),
        communication: getScore('Communication'),
        teamwork: getScore('Teamwork'),
        reliability: getScore('Reliability'),
        feedback: review.overallFeedback
      });
    } else {
      setReviewForm({ technical: 0, communication: 0, teamwork: 0, reliability: 0, feedback: '' });
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedReview) return;
    
    const newRatings = [
      { category: 'Technical Skills', score: reviewForm.technical },
      { category: 'Communication', score: reviewForm.communication },
      { category: 'Teamwork', score: reviewForm.teamwork },
      { category: 'Reliability', score: reviewForm.reliability }
    ];
    
    const avg = newRatings.reduce((acc, r) => acc + r.score, 0) / newRatings.length;

    const updatedReview: PerformanceReview = {
      ...selectedReview,
      status: 'completed',
      score: parseFloat(avg.toFixed(1)),
      ratings: newRatings,
      overallFeedback: reviewForm.feedback,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => prev.map(r => r.id === selectedReview.id ? updatedReview : r));
    setIsReviewModalOpen(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Performance Score</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{avgScore}<span className="text-sm text-gray-400 font-normal">/5.0</span></h3>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +0.2 vs last cycle
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reviews Completed</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completedReviews.length}</h3>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {reviews.length - completedReviews.length} pending
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Top Performer</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
                {topPerformer ? topPerformer.employeeName : '-'}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Score: {topPerformer?.score || 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Cycle</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {cycles.find(c => c.status === 'active')?.name.split(' ')[0] || 'None'}
              </h3>
              <p className="text-xs text-gray-500">Ends: {cycles.find(c => c.status === 'active')?.endDate}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Performance Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-80">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Review Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reviewsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {reviewsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderReviewsList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
         <h3 className="font-bold text-gray-900 dark:text-white">Employee Reviews</h3>
       </div>
       <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium">
             <tr>
               <th className="px-6 py-3">Employee</th>
               <th className="px-6 py-3">Cycle</th>
               <th className="px-6 py-3">Status</th>
               <th className="px-6 py-3 text-center">Score</th>
               <th className="px-6 py-3 text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map(review => (
              <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{review.employeeName}</td>
                <td className="px-6 py-4 text-gray-500">{review.cycleName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                    ${review.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      review.status === 'scheduled' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                  `}>
                    {review.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                  {review.score > 0 ? review.score : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleOpenReview(review)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {review.status === 'completed' ? 'View Details' : 'Conduct Review'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
       </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <BarChart3 className="w-6 h-6 text-indigo-600" /> HR Performance
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and evaluate employee performance.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Dashboard
           </button>
           <button 
             onClick={() => setActiveTab('reviews')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Reviews
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'reviews' && renderReviewsList()}
      </div>

      {isReviewModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
             <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
               <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Review</h3>
                 <p className="text-sm text-gray-500">{selectedReview.employeeName} • {selectedReview.cycleName}</p>
               </div>
               <button onClick={() => setIsReviewModalOpen(false)}><div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">✕</div></button>
             </div>
             
             <div className="space-y-6">
               {['Technical Skills', 'Communication', 'Teamwork', 'Reliability'].map((category, idx) => {
                 const key = category.split(' ')[0].toLowerCase() as keyof typeof reviewForm;
                 return (
                   <div key={idx} className="space-y-2">
                     <div className="flex justify-between items-center">
                       <label className="font-medium text-gray-700 dark:text-gray-300">{category}</label>
                       <span className="text-sm font-bold text-indigo-600">{reviewForm[key]}/5</span>
                     </div>
                     <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                           key={star}
                           disabled={selectedReview.status === 'completed'}
                           type="button"
                           onClick={() => setReviewForm({...reviewForm, [key]: star})}
                           className={`p-2 rounded-lg transition-all ${star <= (reviewForm[key] as number) ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                         >
                           <Star className={`w-5 h-5 ${star <= (reviewForm[key] as number) ? 'fill-current' : ''}`} />
                         </button>
                       ))}
                     </div>
                   </div>
                 );
               })}

               <div>
                 <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Feedback</label>
                 <textarea 
                   disabled={selectedReview.status === 'completed'}
                   rows={4}
                   value={reviewForm.feedback}
                   onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})}
                   className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                   placeholder="Enter detailed feedback here..."
                 />
               </div>

               <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                 {selectedReview.status !== 'completed' && (
                   <button onClick={handleSubmitReview} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                     Submit Review
                   </button>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPerformance;
