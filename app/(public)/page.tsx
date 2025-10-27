import Image from 'next/image'
import Link from 'next/link'
import heroImage from '@/public/landing-hero.jpg'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className='flex flex-col items-center justify-center w-full'>
      <section className='w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24 text-center'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Seamless Communication, Anywhere
        </h1>

        <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
          Chatly helps teams and creators connect through real-time chat, audio,
          and video — all in one platform.
        </p>

        <div className='mt-8 flex justify-center gap-4'>
          <Button asChild size='lg'>
            <Link href='/signup'>Get Started</Link>
          </Button>
          <Button asChild size='lg' variant={'outline'}>
            <Link href='/features'>View Features</Link>
          </Button>
        </div>

        <div className='mt-12'>
          <Image
            src={heroImage}
            alt='Chatly hero'
            width={1200}
            height={600}
            priority
            className='rounded-2xl shadow-lg mx-auto'
          />
        </div>
      </section>

      {/* Trusted By Section */}
      <section className='w-full bg-gray-50 py-16'>
        <div className='max-w-6xl mx-auto px-6 text-center'>
          <h2 className='text-2xl font-semibold mb-8'>
            Trusted by early teams and creators
          </h2>
          <div className='flex justify-center flex-wrap gap-12 opacity-80'>
            <Image src={heroImage} alt='Company logo' width={100} height={40} />
            <Image src={heroImage} alt='Company logo' width={100} height={40} />
            <Image src={heroImage} alt='Company logo' width={100} height={40} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='w-full max-w-6xl px-6 py-24 text-center'>
        <h2 className='text-3xl font-semibold mb-10'>
          What early users are saying
        </h2>
        <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-3'>
          {[
            {
              name: 'Alex R.',
              quote:
                'Chatly made remote communication so smooth — love the simplicity!',
            },
            {
              name: 'Samantha K.',
              quote:
                'A clean UI and powerful features. Perfect for our small team.',
            },
            {
              name: 'Jordan M.',
              quote:
                'Fast, reliable, and feels modern. Excited for what’s next!',
            },
          ].map((t, i) => (
            <div
              key={i}
              className='p-6 border rounded-2xl shadow-sm bg-white flex flex-col items-center'
            >
              <Image
                src={heroImage}
                alt={t.name}
                width={80}
                height={80}
                className='rounded-full mb-4'
              />
              <p className='text-gray-600 italic mb-2'>“{t.quote}”</p>
              <span className='text-sm font-medium text-gray-900'>
                {t.name}
              </span>
              <span className='text-xs text-gray-400'>Beta User</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className='w-full bg-gray-50 py-24'>
        <div className='max-w-4xl mx-auto px-6'>
          <h2 className='text-3xl font-semibold text-center mb-10'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-6'>
            {[
              {
                q: 'Is Chatly free to use?',
                a: 'Yes! Chatly is free to start. Paid plans will unlock additional features in the future.',
              },
              {
                q: 'Do I need to install anything?',
                a: 'Nope. Chatly runs entirely in your browser — no downloads required.',
              },
              {
                q: 'Can I use Chatly for my business?',
                a: 'Absolutely. Chatly is built for teams, startups, and creators of all sizes.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, your messages are encrypted and stored securely. We take privacy seriously.',
              },
            ].map((item, i) => (
              <div key={i} className='border-b pb-4'>
                <h3 className='font-semibold text-lg'>{item.q}</h3>
                <p className='text-gray-600 mt-2'>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='w-full py-24 text-center'>
        <h2 className='text-3xl font-semibold mb-6'>
          Start chatting instantly with your team — for free.
        </h2>
        <Link
          href='/signup'
          className='px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-lg'
        >
          Get Started
        </Link>
      </section>
    </main>
  )
}
