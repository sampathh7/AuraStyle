import React, { useState, useMemo } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  ExternalLink,
  Send,
  Plus,
  Sparkles,
  Link as LinkIcon,
  Shuffle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OutfitLook } from '../types';
import { formatPrice, convertAmount } from '../utils/currencies';
import {
  calculateStyleCompatibility,
  rankCommunityPostsByCompatibility,
} from '../utils/styleCompatibility';
import { StyleCompatibilityBadge } from './StyleCompatibilityBadge';
import { WardrobeMixMatchModal } from './WardrobeMixMatchModal';

export const CommunityBoardsView: React.FC = () => {
  const {
    communityPosts,
    upvotePost,
    addCommentToPost,
    createCommunityPost,
    currency,
    savedLooks,
    setActiveOutfitModalLook,
    setShareModalLook,
    user,
    setAuthModalOpen,
  } = useApp();

  const [filterOccasion, setFilterOccasion] = useState<string>('all');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [suggestedUrl, setSuggestedUrl] = useState('');
  const [sortByCompatibility, setSortByCompatibility] = useState<boolean>(false);
  const [activeMixMatchLook, setActiveMixMatchLook] = useState<OutfitLook | null>(null);

  // New post modal
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedLookId, setSelectedLookId] = useState<string>(
    savedLooks[0]?.id || ''
  );
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostTags, setNewPostTags] = useState('BudgetCouture, WeddingStyle');

  // Compute compatibility rankings for all community posts against user's saved wardrobe
  const rankedPosts = useMemo(() => {
    return rankCommunityPostsByCompatibility(communityPosts, savedLooks);
  }, [communityPosts, savedLooks]);

  const topRecommendations = useMemo(() => {
    return rankedPosts.slice(0, 3);
  }, [rankedPosts]);

  const filteredPosts = useMemo(() => {
    let posts = filterOccasion === 'all'
      ? communityPosts
      : communityPosts.filter((p) =>
          p.look.occasion.toLowerCase().includes(filterOccasion.toLowerCase())
        );

    if (sortByCompatibility) {
      const scoreMap = new Map(
        rankedPosts.map((r) => [r.post.id, r.compatibility.score])
      );
      posts = [...posts].sort(
        (a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0)
      );
    }
    return posts;
  }, [communityPosts, filterOccasion, sortByCompatibility, rankedPosts]);

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    addCommentToPost(postId, commentText, suggestedUrl.trim() || undefined);
    setCommentText('');
    setSuggestedUrl('');
    setActiveCommentPostId(null);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenLook = savedLooks.find((l) => l.id === selectedLookId);
    if (!chosenLook) return;

    const tags = newPostTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    createCommunityPost(chosenLook, newPostCaption, tags);
    setNewPostCaption('');
    setShowNewPostModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Community Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>Community Style Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Crowdsourced Dupes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-950 dark:text-white">
            Community Lookbooks & Recommendations
          </h2>
        </div>

        <button
          onClick={() => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              setShowNewPostModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Share Your Lookbook</span>
        </button>
      </div>

      {/* Wardrobe Mix-and-Match Synergy Banner / Recommendations Carousel */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181f30] to-slate-900 border border-amber-500/25 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Wardrobe Mix & Match Recommendations</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                  Personalized
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {savedLooks.length > 0
                  ? `Complementary pieces analyzed against your ${savedLooks.length} saved wardrobe look${savedLooks.length === 1 ? '' : 's'}`
                  : 'Save outfits to your collection to unlock personalized closet synergy scores'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSortByCompatibility(!sortByCompatibility)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              sortByCompatibility
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sortByCompatibility ? 'Sorted by Compatibility (Active)' : 'Sort by Wardrobe Match'}</span>
          </button>
        </div>

        {/* Top Compatible Community Picks Shelf */}
        {topRecommendations.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topRecommendations.map(({ post, compatibility }) => (
              <div
                key={post.id}
                onClick={() => setActiveMixMatchLook(post.look)}
                className="p-3 rounded-xl bg-black/45 hover:bg-black/65 border border-white/10 hover:border-amber-400/40 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {compatibility.matchLevel}
                    </span>
                    <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md tabular-nums border border-amber-400/30">
                      {compatibility.score}% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {post.look.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                    {compatibility.mixMatchCombos[0]?.stylingAdvice || compatibility.paletteHarmonyDescription}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{post.look.items.length} pieces</span>
                  <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Mix & Match →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium scrollbar-none">
        {[
          { id: 'all', label: 'All Ensembles' },
          { id: 'wedding', label: 'Celebrations & Weddings' },
          { id: 'gala', label: 'Galas & Soirées' },
          { id: 'streetwear', label: 'Streetwear' },
          { id: 'daily', label: 'Daily Wear' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterOccasion(f.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              filterOccasion === f.id
                ? 'bg-slate-950 text-white dark:bg-amber-400 dark:text-slate-950 font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const dupePrice = convertAmount(
            post.look.budgetSummary.budgetDupeTotal,
            post.look.budgetSummary.currency,
            currency
          );

          return (
            <article
              key={post.id}
              className="bg-white dark:bg-[#121824] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Author Info */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.look.authorAvatar}
                      alt={post.look.authorName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/20"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {post.look.authorName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{post.look.occasion}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatPrice(dupePrice, currency)} Total
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShareModalLook(post.look)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition"
                    title="Share Post"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Caption */}
                <div className="p-4 sm:p-5 pb-3">
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {post.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Style Compatibility Score Badge with Mix & Match trigger */}
                <div className="px-4 sm:px-5 pb-3">
                  <StyleCompatibilityBadge
                    compatibility={calculateStyleCompatibility(post.look, savedLooks)}
                    onExploreMixMatch={() => setActiveMixMatchLook(post.look)}
                  />
                </div>

                {/* Outfit Preview Card inside post */}
                <div className="px-4 sm:px-5 pb-3">
                  <div
                    onClick={() => setActiveOutfitModalLook(post.look)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {post.look.items.length} pieces deconstructed
                      </div>
                      <h5 className="text-sm font-bold font-editorial text-slate-900 dark:text-white">
                        {post.look.title}
                      </h5>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      View Deals →
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Interactions & Comments Area */}
              <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                {/* Upvotes & Comment Toggles */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => upvotePost(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                        post.hasUpvoted
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{post.upvotes}</span>
                      <span>Votes</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPostId(
                          activeCommentPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments.length} Comments & Dupes</span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {post.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">
                            {comm.authorName}
                          </span>
                          <span>{comm.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                          {comm.text}
                        </p>
                        {comm.suggestedAlternativeUrl && (
                          <a
                            href={comm.suggestedAlternativeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline mt-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Check suggested alternative link</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input Form */}
                {activeCommentPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                    <input
                      type="text"
                      placeholder="Add stylist feedback or advice..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="url"
                          placeholder="Optional: Paste link to cheaper alternative"
                          value={suggestedUrl}
                          onChange={(e) => setSuggestedUrl(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 text-[11px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText.trim()}
                        className="px-3 py-1 text-xs font-semibold rounded-xl bg-amber-400 text-slate-950 disabled:opacity-40 transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Share New Lookbook Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-editorial text-slate-950 dark:text-white mb-4">
              Publish Look to Community
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Wardrobe Look
                </label>
                <select
                  value={selectedLookId}
                  onChange={(e) => setSelectedLookId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                >
                  {savedLooks.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.occasion})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Caption / Styling Narrative
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share how you styled this or why you chose these budget pieces..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WeddingStyle, MyntraFinds, ChampagneGala"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wardrobe Mix & Match Modal */}
      {activeMixMatchLook && (
        <WardrobeMixMatchModal
          communityLook={activeMixMatchLook}
          onClose={() => setActiveMixMatchLook(null)}
        />
      )}
    </div>
  );
};
