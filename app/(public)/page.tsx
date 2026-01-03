import Image from 'next/image'
import Link from 'next/link'
import heroImage from '@/public/landing-hero.jpg'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const faqs = [
  {
    question: 'Is Chatly free to use?',
    answer:
      'Yes. Chatly offers a generous free plan with unlimited 1:1 text messaging, message history, typing indicators, and notifications. Paid plans add higher limits for media sharing and AI-assisted message improvements.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'Nope. Chatly runs entirely in your browser — no downloads, updates, or installations required. You can log in and start chatting instantly from any device. This means your team stays in sync, no matter where they’re working from.',
  },
  {
    question: 'Can I use Chatly for my business?',
    answer:
      'Yes. Chatly is designed for individuals, startups, and small teams who want simple, reliable 1:1 communication. It focuses on clarity and speed rather than complex enterprise workflows.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Chatly uses modern authentication, database security rules, and HTTPS encryption to protect your data. Messages are securely stored to support features like message history, syncing across devices, and notifications.',
  },
]

export default function HomePage() {
  return (
    <main className='flex flex-col items-center justify-center w-full'>
      <section className='w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24 text-center'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'>
          Seamless Communication, Anywhere
        </h1>

        <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
          Chatly helps people connect through fast, real-time 1:1 chat with
          media sharing, typing indicators, and a clean, focused interface —
          built for the modern web.
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

      <section className='w-full py-16 sm:py-20 md:py-24 bg-background'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold tracking-tight mb-10'>
            Frequently Asked Questions
          </h2>

          <Accordion
            type='single'
            collapsible
            className='w-full text-left space-y-2 md:space-y-4'
          >
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className='text-base font-medium hover:no-underline cursor-pointer'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground leading-relaxed'>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className='w-full py-24 text-center'>
        <div className='max-w-2xl mx-auto px-6'>
          <h2 className='text-3xl sm:text-4xl font-bold tracking-tight'>
            Ready to simplify how your team communicates?
          </h2>
          <p className='mt-8 text-lg text-muted-foreground max-w-xl mx-auto'>
            Get started with Chatly today — it&apos;s free, fast, and built for
            collaboration.
          </p>

          <div className='mt-8 flex justify-center'>
            <Button asChild size='lg'>
              <Link href='/signup'>Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
