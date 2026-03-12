import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, MessageCircle } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, type BlogPost, type ContentBlock } from '../blogs.ts';
import { WHATSAPP_NUMBER } from '../constants.ts';

interface BlogPostViewProps {
  slug: string;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onNavigate: (page: string) => void;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const renderBlock = (block: ContentBlock, idx: number): React.ReactNode => {
  switch (block.type) {
    case 'p':
      return (
        <p key={idx} className="text-[#4A3728]/75 text-base sm:text-lg leading-relaxed mb-5">
          {block.text}
        </p>
      );
    case 'h2':
      return (
        <h2 key={idx} className="text-2xl sm:text-3xl font-bold serif text-[#4A3728] mt-12 mb-4 leading-tight">
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={idx} className="text-xl font-bold serif text-[#4A3728] mt-8 mb-3">
          {block.text}
        </h3>
      );
    case 'ul':
      return (
        <ul key={idx} className="mb-6 space-y-2.5 pl-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#4A3728]/75 text-base leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-coral flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className="mb-6 space-y-3 pl-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[#4A3728]/75 text-base leading-relaxed">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-coral/10 text-coral text-[11px] font-black flex items-center justify-center brand-rounded mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote key={idx} className="my-8 pl-6 border-l-4 border-[#D4AF37] italic text-[#4A3728]/70 text-lg leading-relaxed">
          "{block.text}"
        </blockquote>
      );
    case 'tip':
      return (
        <div key={idx} className="my-8 bg-[#FFF8EE] border border-[#D4AF37]/20 rounded-[1.5rem] p-6 sm:p-8">
          <p className="text-[10px] brand-rounded font-black uppercase tracking-[0.25em] text-[#D4AF37] mb-2">
            {block.heading}
          </p>
          <p className="text-[#4A3728]/75 text-sm sm:text-base leading-relaxed">
            {block.text}
          </p>
        </div>
      );
    case 'divider':
      return <hr key={idx} className="my-10 border-[#4A3728]/10" />;
    default:
      return null;
  }
};

const BlogPostView: React.FC<BlogPostViewProps> = ({ slug, onBack, onSelectPost, onNavigate }) => {
  const post = getPostBySlug(slug);

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold serif text-[#4A3728] mb-4">Post Not Found</h2>
        <p className="text-[#4A3728]/60 mb-8">This article may not be published yet or the link may be incorrect.</p>
        <button
          onClick={onBack}
          className="px-8 py-4 bg-coral text-white rounded-full font-bold brand-rounded uppercase tracking-widest text-xs hover:scale-105 transition-all"
        >
          Back to Journal
        </button>
      </div>
    );
  }

  const related = getRelatedPosts(post);

  return (
    <div className="bg-[#FFF8EE] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E14]/80 via-[#2A1E14]/30 to-[#2A1E14]/20" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-28 sm:top-24 left-4 sm:left-8 z-20 flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 text-white text-[11px] brand-rounded font-bold uppercase tracking-wider hover:bg-white/25 transition-all"
        >
          <ArrowLeft size={14} /> The Journal
        </button>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-16 z-10">
          <div className="max-w-3xl mx-auto">
            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black brand-rounded uppercase tracking-[0.2em] mb-4 ${post.categoryColor}`}>
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold serif text-white leading-tight drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Article body ─────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[#4A3728]/40 text-[10px] brand-rounded font-bold uppercase tracking-widest pb-8 mb-8 border-b border-[#4A3728]/10">
          <span className="flex items-center gap-2"><Calendar size={12} /> {formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-2"><Clock size={12} /> {post.readTime} min read</span>
          <span className="flex items-center gap-2 flex-wrap">
            <Tag size={12} />
            {post.tags.map(t => (
              <span key={t} className="bg-[#4A3728]/5 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </span>
        </div>

        {/* Excerpt intro */}
        <p className="text-lg sm:text-xl text-[#4A3728]/60 leading-relaxed mb-10 font-medium italic border-l-4 border-coral/30 pl-5">
          {post.excerpt}
        </p>

        {/* Content */}
        <div>
          {post.content.map((block, idx) => renderBlock(block, idx))}
        </div>

        {/* ── Bottom CTA ──────────────────────────────────────────── */}
        <div className="mt-16 bg-[#2A1E14] rounded-[2rem] p-8 sm:p-12 text-center">
          <p className="text-[10px] brand-rounded font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-4">
            Ready to Order?
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold serif text-white mb-4">
            Fresh, homemade & delivered to your door
          </h3>
          <p className="text-white/50 text-sm brand-rounded font-medium mb-8 max-w-sm mx-auto">
            No preservatives. Made in small batches by Ami Shah in her home kitchen in Ahmedabad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('shop')}
              className="px-8 py-4 bg-coral text-white rounded-full font-black brand-rounded uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-3"
            >
              Shop Now <ArrowRight size={16} />
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 text-white rounded-full font-black brand-rounded uppercase tracking-widest text-[11px] hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-3"
            >
              <MessageCircle size={16} /> Chat with Ami
            </a>
          </div>
        </div>
      </div>

      {/* ── Related posts ────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-[#4A3728]/10 py-14 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[10px] brand-rounded font-black uppercase tracking-[0.3em] text-[#4A3728]/40">More Stories</span>
              <div className="flex-1 h-px bg-[#4A3728]/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(rp => (
                <article
                  key={rp.id}
                  onClick={() => onSelectPost(rp.slug)}
                  className="group bg-white rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-400 cursor-pointer border border-[#4A3728]/5"
                >
                  <div className="h-40 overflow-hidden">
                    <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black brand-rounded uppercase tracking-widest mb-3 ${rp.categoryColor}`}>{rp.category}</span>
                    <h4 className="font-bold serif text-[#4A3728] text-base leading-snug group-hover:text-coral transition-colors mb-2 line-clamp-2">{rp.title}</h4>
                    <span className="text-[10px] brand-rounded text-coral font-black uppercase tracking-widest flex items-center gap-1 mt-3">
                      Read <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={onBack}
                className="px-8 py-4 border-2 border-coral/20 text-coral rounded-full font-black brand-rounded uppercase tracking-widest text-[11px] hover:bg-coral hover:text-white transition-all"
              >
                View All Stories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostView;
