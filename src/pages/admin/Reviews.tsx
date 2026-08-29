import React, { useState } from 'react';
import { Star, MessageSquare, Shield, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'flagged';
  reply?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'r1',
      customerName: 'Sarah Jenkins',
      productName: 'Silk Evening Gown',
      rating: 5,
      comment: 'Absolutely stunning. The material feels incredible and the fit is perfect.',
      date: '2024-05-12',
      status: 'pending'
    },
    {
      id: 'r2',
      customerName: 'Michael Chang',
      productName: 'Leather Weekend Bag',
      rating: 2,
      comment: 'The zipper broke after two uses. Very disappointed for the price.',
      date: '2024-05-10',
      status: 'flagged',
      reply: 'Hi Michael, we apologize for this. Our support team has reached out to arrange a replacement.'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleStatusChange = (id: string, status: Review['status']) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Review ${status}`);
  };

  const handleReply = (id: string) => {
    if (!replyText[id]) return;
    setReviews(reviews.map(r => r.id === id ? { ...r, reply: replyText[id] } : r));
    toast.success('Reply posted');
    setReplyText(prev => ({ ...prev, [id]: '' }));
  };

  const filteredReviews = reviews.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reviews Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Approve, flag, and reply to customer reviews.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          {['all', 'pending', 'approved', 'flagged'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-colors ${
                filter === f ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reviews found for this filter.</div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{review.customerName}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{review.productName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">{review.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {review.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(review.id, 'approved')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors tooltip" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleStatusChange(review.id, 'flagged')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Flag">
                        <Shield className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {review.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 flex items-center w-fit">
                      Approved
                    </span>
                  )}
                  {review.status === 'flagged' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 flex items-center w-fit">
                      Flagged
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 text-sm">{review.comment}</p>

              {review.reply ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-3 mt-4">
                  <MessageSquare className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block mb-1">Your Reply</span>
                    <p className="text-sm text-gray-600">{review.reply}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 mt-4">
                  <input
                    type="text"
                    value={replyText[review.id] || ''}
                    onChange={e => setReplyText({ ...replyText, [review.id]: e.target.value })}
                    placeholder="Write a public reply..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:bg-white focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                  />
                  <button
                    onClick={() => handleReply(review.id)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors shrink-0"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
