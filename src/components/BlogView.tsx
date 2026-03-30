import React, { useMemo } from 'react';
import { ArrowRight, BookOpen, Calendar, Clock, Sparkles } from 'lucide-react';
import { getPublishedPosts, BLOG_POSTS, type BlogPost } from '../blogs.ts';

interface BlogViewProps {
  onSelectPost: (slug: string) => void;
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const CategoryBadge: React.FC<{ category: string; colorClass: string }> = ({ category, colorClass }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black brand-rounded uppercase tracking-[0.2em] ${colorClass}`}>
    {category}
  </span>
);

const BlogCard: React.FC<{ post: BlogPost; onSelect: () => void; featured?: boolean }> = ({ post, onSelect, featured }) => (
  <article
    onClick={onSelect}
    className={`group bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-[#4A3728]/5 ${featured ? 'lg:flex' : 'flex flex-col'}`}
  >
    {/* Cover image */}
    <div className={`relative overflow-hidden bg-[#FDFBF7] ${featured ? 'lg:w-5/12 h-56 lg:h-auto' : 'h-52'}`}>
      <img
        src={post.coverImage}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E14]/30 via-transparent to-transparent" />
      <div className="absolute top-4 left-4">
        <CategoryBadge category={post.category} colorClass={`${post.categoryColor} shadow-sm`} />
      </div>
    </div>

    {/* Content */}
    <div className={`flex flex-col justify-between p-6 ${featured ? 'lg:w-7/12 lg:p-10' : 'flex-1'}`}>
      <div>
        <div className="flex items-center gap-4 text-[#4A3728]/40 text-[10px] brand-rounded font-bold uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1.5"><Calendar size={11} /> {formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1.5"><Clock size={11} /> {post.readTime} min read</span>
        </div>

        <h2 className={`serif font-bold text-[#4A3728] group-hover:text-coral transition-colors leading-tight mb-3 ${featured ? 'text-2xl lg:text-4xl' : 'text-xl'}`}>
          {post.title}
        </h2>

        <p className="text-[#4A3728]/60 text-sm leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-coral font-black brand-rounded uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all duration-300">
        Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </article>
);

const BlogView: React.FC<BlogViewProps> = ({ onSelectPost }) => {
  const published = useMemo(() => getPublishedPosts(), []);
  const [featured, ...rest] = published;

  // Find next scheduled post
  const today = new Date().toISOString().split('T')[0];
  const nextPost = useMemo(
    () => BLOG_POSTS.filter(p => p.publishedAt > today).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))[0],
    [today]
  );

  return (
    <div className="pt-24 sm:pt-20 bg-[#FFF8EE] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2A1E14] py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #F04E4E 0%, transparent 60%), radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 50%)' }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white brand-rounded text-[10px] font-black uppercase tracking-[0.4em] mb-8 animate-in slide-in-from-top duration-700">
            <Sparkles size={12} className="text-[#D4AF37]" /> Stories from our Kitchen
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white serif mb-6 leading-tight drop-shadow-xl">
            The <span className="text-[#D4AF37] brand-script">Journal</span>
          </h1>
          <p className="text-white/60 text-lg brand-rounded font-medium max-w-xl mx-auto leading-relaxed">
            Gifting guides, mukhwas wisdom, health stories, and the traditions behind every jar we make.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10 text-white/40 text-xs brand-rounded font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><BookOpen size={14} /> {published.length} Articles</span>
            <span>·</span>
            <span className="flex items-center gap-2"><Clock size={14} /> New post every 3–4 days</span>
          </div>
        </div>
      </section>

      {/* ── Posts ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

        {published.length === 0 && (
          <div className="text-center py-24">
            <BookOpen size={48} className="text-coral/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold serif text-[#4A3728] mb-3">Coming Soon</h2>
            <p className="text-[#4A3728]/50 brand-rounded font-medium">Our first story drops very soon. Check back in a few days.</p>
          </div>
        )}

        {featured && (
          <div className="mb-10 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] brand-rounded font-black uppercase tracking-[0.3em] text-coral">Featured Story</span>
              <div className="flex-1 h-px bg-coral/10" />
            </div>
            <BlogCard post={featured} onSelect={() => onSelectPost(featured.slug)} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[10px] brand-rounded font-black uppercase tracking-[0.3em] text-[#4A3728]/40">More Stories</span>
              <div className="flex-1 h-px bg-[#4A3728]/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {rest.map(post => (
                <BlogCard key={post.id} post={post} onSelect={() => onSelectPost(post.slug)} />
              ))}
            </div>
          </div>
        )}

        {/* Next post teaser */}
        {nextPost && (
          <div className="mt-16 sm:mt-24 bg-white rounded-[2rem] p-8 sm:p-12 border border-[#D4AF37]/15 shadow-lg text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37] mx-auto mb-6">
              <Clock size={24} />
            </div>
            <p className="text-[10px] brand-rounded font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-3">Next Story Drops</p>
            <h3 className="text-xl sm:text-2xl font-bold serif text-[#4A3728] mb-2">{nextPost.title}</h3>
            <p className="text-[#4A3728]/50 text-sm brand-rounded font-medium">
              Publishing on {formatDate(nextPost.publishedAt)}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogView;
