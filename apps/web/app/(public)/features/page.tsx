import Image from 'next/image'
import heroImage from '@/public/landing-hero.jpg'
import messagingImage from '@/public/features/messaging.png'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    title: '1:1 Messaging',
    description:
      'Send and receive messages in real time with a clean, focused chat experience designed for clarity and speed.',
    image: messagingImage,
  },
  {
    title: 'Media Attachments',
    description:
      'Share images and files directly in chat. Uploads are securely stored and optimized for fast access.',
    image: heroImage,
  },
  {
    title: 'AI Message Enhancements',
    description:
      'Improve clarity and tone of your messages with AI-assisted enhancements — without changing your intent.',
    image: heroImage,
  },
  {
    title: 'Usage Limits & Billing',
    description:
      'Clear daily usage limits per plan, with transparent billing and easy subscription management.',
    image: heroImage,
  },
]

export default function FeaturesPage() {
  return (
    <main className='flex w-full flex-col items-center justify-center'>
      <section className='w-full max-w-6xl px-6 py-16 text-center sm:py-20 md:py-24'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Powerful Features Built for Connection
        </h1>

        <p className='text-muted-foreground mx-auto mt-8 max-w-2xl text-lg'>
          Chatly brings together all the ways you communicate — text, images,
          voice, and video — in one seamless, secure platform.
        </p>
      </section>

      <section className='w-full max-w-6xl space-y-12 px-6 md:space-y-24'>
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col items-center gap-12 md:flex-row ${
              index % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className='flex-1'>
              <Image
                src={feature.image}
                alt={feature.title}
                className='h-80 w-full rounded-2xl object-cover shadow-md'
              />
            </div>
            <div className='flex-1'>
              <h2 className='text-3xl font-semibold'>{feature.title}</h2>
              <p className='text-muted-foreground mt-4 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className='w-full py-24 text-center'>
        <div className='mx-auto max-w-2xl px-6'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            You&apos;ve seen what Chatly can do — now experience it for
            yourself.
          </h2>
          <p className='text-muted-foreground mx-auto mt-8 max-w-xl text-lg'>
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
