import Image from 'next/image'
import heroImage from '@/public/landing-hero.jpg'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    title: 'Text Chat',
    description:
      'Chatly makes text conversations effortless. Send messages instantly, react to them, and stay connected with your friends and team anywhere in the world.',
    image: heroImage,
  },
  {
    title: 'Image Chat',
    description:
      'Go beyond words — share images, screenshots, and media seamlessly. Chatly automatically optimizes them for fast delivery and viewing.',
    image: heroImage,
  },
  {
    title: 'Audio Calls',
    description:
      'Experience reliable, low-latency audio calls that make distance feel irrelevant. Perfect for quick catch-ups or deep conversations.',
    image: heroImage,
  },
  {
    title: 'Video Calls',
    description:
      'Bring your conversations to life with high-quality video calls. Chatly is designed to work smoothly even with slower connections.',
    image: heroImage,
  },
  {
    title: 'Real-time Sync',
    description:
      'Start a chat on your laptop and pick it up instantly on your phone. Chatly automatically keeps all your messages and calls synced.',
    image: heroImage,
  },
]

export default function FeaturesPage() {
  return (
    <main className='flex flex-col items-center justify-center w-full'>
      <section className='w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24 text-center'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Powerful Features Built for Connection
        </h1>

        <p className='mt-8 text-lg text-muted-foreground max-w-2xl mx-auto'>
          Chatly brings together all the ways you communicate — text, images,
          voice, and video — in one seamless, secure platform.
        </p>
      </section>

      <section className='w-full max-w-6xl px-6 space-y-12 md:space-y-24'>
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col md:flex-row items-center gap-12 ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className='flex-1'>
              <Image
                src={feature.image}
                alt={feature.title}
                className='rounded-2xl shadow-md object-cover w-full h-80'
              />
            </div>
            <div className='flex-1'>
              <h2 className='text-3xl font-semibold'>{feature.title}</h2>
              <p className='mt-4 leading-relaxed text-muted-foreground'>
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className='w-full py-24 text-center'>
        <div className='max-w-2xl mx-auto px-6'>
          <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>
            You&apos;ve seen what Chatly can do — now experience it for
            yourself.
          </h2>
          <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
            Start building better connections with your team today. It&apos;s
            fast, secure, and completely free to get started.
          </p>

          <div className='mt-8 flex justify-center gap-4'>
            <Button asChild size='lg'>
              <Link href='/signup'>Start for Free</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/pricing'>View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
