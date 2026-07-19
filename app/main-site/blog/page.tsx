import { MainSiteHeader } from "@/components/main-site/MainSiteHeader";
import { MainSiteFooter } from "@/components/main-site/MainSiteFooter";

const POSTS = [
  {
    title: "Educational technology and mobile learning",
    date: "April 4, 2021",
    excerpt: "In order to write the perfect blog post, you need to break your content up into paragraphs. While most blog posts use paragraphs, few use them well. Take the time to put links in your blog post...",
  },
  {
    title: "Information About Teacher Certification",
    date: "April 3, 2021",
    excerpt: "In order to write the perfect blog post, you need to break your content up into paragraphs. While most blog posts use paragraphs, few use them well. Take the time to put links in your blog post...",
  },
  {
    title: "The evidence on how to find the right career",
    date: "April 2, 2021",
    excerpt: "In order to write the perfect blog post, you need to break your content up into paragraphs. While most blog posts use paragraphs, few use them well. Take the time to put links in your blog post...",
  },
  {
    title: "How to set yourself up for success a new career",
    date: "April 1, 2021",
    excerpt: "In order to write the perfect blog post, you need to break your content up into paragraphs. While most blog posts use paragraphs, few use them well. Take the time to put links in your blog post...",
  },
  {
    title: "What is cybersecurity? a beginner's guide",
    date: "April 1, 2021",
    excerpt: "Or, would you prefer a straightforward response that covers key points and makes sense of abstract concepts? Though clarity is key, Google also places a high value on being thorough...",
  },
  {
    title: "Primary and secondary school final exams",
    date: "March 3, 2021",
    excerpt: "Or, would you prefer a straightforward response that covers key points and makes sense of abstract concepts? Though clarity is key, Google also places a high value on being thorough...",
  },
  {
    title: "We are changing the way the world learns",
    date: "September 23, 2020",
    excerpt: "In order to write the perfect blog post, you need to break your content up into paragraphs. While most blog posts use paragraphs, few use them well. Take the time to put links in your blog post...",
  },
];

export default function BlogPage() {
  return (
    <>
      <MainSiteHeader />

      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-brand-green uppercase tracking-widest mb-4">Blog</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">Stories, Insights &amp; Updates</h1>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          {POSTS.map((post) => (
            <article key={post.title} className="border-b border-gray-100 pb-10 last:border-0">
              <p className="text-xs text-gray-400 mb-2">{post.date}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
              <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <MainSiteFooter />
    </>
  );
}
