'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { Star, CheckCircle2, MessageSquarePlus, X, Send, Globe, ArrowRight } from 'lucide-react';
import initialReviews from '@/app/data/reviews.json';

interface Review {
  id: string;
  name: string;
  designation?: string;
  country: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

interface ReviewSectionProps {
  limit?: number;
  showViewAllLink?: boolean;
}

const COUNTRY_OPTIONS = [
  { label: '🇺🇸 United States', value: '🇺🇸 United States' },
  { label: '🇮🇳 India', value: '🇮🇳 India' },
  { label: '🇬🇧 United Kingdom', value: '🇬🇧 United Kingdom' },
  { label: '🇩🇪 Germany', value: '🇩🇪 Germany' },
  { label: '🇨🇦 Canada', value: '🇨🇦 Canada' },
  { label: '🇦🇺 Australia', value: '🇦🇺 Australia' },
  { label: '🇯🇵 Japan', value: '🇯🇵 Japan' },
  { label: '🌐 Other', value: '🌐 Global' },
];

export const ReviewSection: React.FC<ReviewSectionProps> = ({ limit, showViewAllLink = false }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track client mount so portal target exists
  const [isMounted, setIsMounted] = useState(false);

  // Fetch live reviews from Supabase DB via API route
  const fetchLiveReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchLiveReviews();
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [country, setCountry] = useState('🇺🇸 United States');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: totalReviews > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!comment.trim()) errors.comment = 'Please write a brief review.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Google reCAPTCHA v3 token generation
      let recaptchaToken = '';
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (siteKey && typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          recaptchaToken = await new Promise<string>((resolve) => {
            (window as any).grecaptcha.ready(async () => {
              const token = await (window as any).grecaptcha.execute(siteKey, { action: 'submit_review' });
              resolve(token);
            });
          });
        } catch (recaptchaErr) {
          console.error('reCAPTCHA execution error:', recaptchaErr);
        }
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          designation: designation.trim(),
          country,
          rating,
          comment: comment.trim(),
          website_hp: honeypot,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        // Refresh live reviews list from DB
        await fetchLiveReviews();
      } else {
        setServerError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setServerError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDesignation('');
    setCountry('🇺🇸 United States');
    setRating(5);
    setComment('');
    setHoneypot('');
    setSubmitSuccess(false);
    setServerError(null);
    setFormErrors({});
    setIsModalOpen(false);
  };

  return (
    <>
      <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block mb-1">
              Community Feedback
            </span>
            <h2 className="text-h2 text-theme-main">Developer Reviews & Ratings</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Write a Review
          </button>
        </div>

        {/* Rating Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-xl bg-surface border border-theme-subtle items-center">
          
          {/* Average Rating Score */}
          <div className="md:col-span-4 text-center md:border-r md:border-theme-subtle md:pr-6 space-y-2">
            <div className="text-5xl font-mono font-bold text-theme-main">{avgRating}</div>
            <div className="flex justify-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-xs font-mono text-theme-muted">
              Based on {totalReviews} verified reviews
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-12 text-theme-muted flex items-center gap-1">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-app rounded-full overflow-hidden border border-theme-subtle">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-theme-muted">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List / Empty State */}
        {reviews.length === 0 ? (
          <div className="py-12 px-6 rounded-xl bg-surface border border-theme-subtle text-center space-y-4 max-w-xl mx-auto">
            <MessageSquarePlus className="w-12 h-12 text-[#1D9BF0] mx-auto opacity-80" />
            <div className="space-y-1">
              <h3 className="text-h3 text-theme-main">We are waiting for your review & rating!</h3>
              <p className="text-body-small text-theme-muted">
                Be the first developer to share your feedback and rate C³ MindLoop tools.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Star className="w-4 h-4 fill-white" />
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(limit ? reviews.slice(0, limit) : reviews).map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl bg-surface border border-theme-subtle flex flex-col justify-between space-y-4 transition-all hover:border-theme-subtle/80"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-theme-muted">{rev.date}</span>
                  </div>
                  <p className="text-body-small text-theme-main leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-theme-subtle flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-theme-main">{rev.name}</span>
                      <span className="text-theme-muted text-[11px] px-1.5 py-0.5 rounded bg-app border border-theme-subtle">
                        {rev.country}
                      </span>
                    </div>
                    {rev.designation && (
                      <span className="text-theme-muted text-[11px] font-sans">
                        {rev.designation}
                      </span>
                    )}
                  </div>
                  {rev.verified && (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Optional View All Reviews Link */}
        {showViewAllLink && reviews.length > 0 && (
          <div className="text-center pt-2">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-sm font-mono text-[#1D9BF0] hover:text-[#1A8CD8] font-medium hover:underline transition-colors"
            >
              View All {reviews.length} Developer Reviews
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>

      {/* Review Modal — rendered via portal to document.body to escape z-index stacking context */}
      {isMounted && isModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-surface border border-theme-subtle rounded-xl shadow-2xl p-6 sm:p-8 relative space-y-6">
            
            {/* Close Modal Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-theme-muted hover:text-theme-main p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="text-h3 text-theme-main">Thank You for Your Review!</h3>
                <p className="text-body-small text-theme-muted">
                  Your feedback has been submitted successfully and notified to our moderation channel.
                </p>
                <button
                  onClick={resetForm}
                  className="bg-theme-subtle hover:bg-neutral-800 text-theme-main text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field */}
                <input
                  type="text"
                  name="website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="space-y-1">
                  <h3 className="text-h3 text-theme-main">Write a Developer Review</h3>
                  <p className="text-xs text-theme-muted">
                    Share your experience using C³ MindLoop tools and utilities.
                  </p>
                </div>

                {serverError && (
                  <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                    {serverError}
                  </div>
                )}

                {/* Star Rating Interactive Selector */}
                <div>
                  <label className="block text-xs font-mono font-medium text-theme-muted mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-theme-muted ml-2">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="e.g. Alex Miller"
                    className={`w-full bg-app border rounded-lg px-3.5 py-2 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-theme-subtle focus:border-[#1D9BF0]'
                    }`}
                  />
                  {formErrors.name && (
                    <span className="text-red-500 text-xs mt-1 block font-mono">{formErrors.name}</span>
                  )}
                </div>

                {/* Designation / Role Input */}
                <div>
                  <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer / DevOps Lead"
                    className="w-full bg-app border border-theme-subtle rounded-lg px-3.5 py-2 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                  />
                </div>

                {/* Country Dropdown Selector */}
                <div>
                  <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-app border border-theme-subtle rounded-lg px-3.5 py-2 text-body-small text-theme-main focus:outline-none focus:border-[#1D9BF0]"
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                    Review / Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (formErrors.comment) setFormErrors({ ...formErrors, comment: '' });
                    }}
                    placeholder="What did you like about our tools?"
                    className={`w-full bg-app border rounded-lg p-3 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none ${
                      formErrors.comment ? 'border-red-500' : 'border-theme-subtle focus:border-[#1D9BF0]'
                    }`}
                  />
                  {formErrors.comment && (
                    <span className="text-red-500 text-xs mt-1 block font-mono">{formErrors.comment}</span>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>,
      document.body
    )}
  </>);
};
