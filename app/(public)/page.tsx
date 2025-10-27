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
      'Yes! Chatly is free to start, so you can explore all the essential features without paying a cent. Our goal is to make communication effortless for everyone. In the future, we’ll introduce paid plans for teams who need advanced analytics, integrations, and storage — but the free tier will always stay generous.',
  },
  {
    question: 'Do I need to install anything?',
    answer:
      'Nope. Chatly runs entirely in your browser — no downloads, updates, or installations required. You can log in and start chatting instantly from any device. This means your team stays in sync, no matter where they’re working from.',
  },
  {
    question: 'Can I use Chatly for my business?',
    answer:
      'Absolutely. Chatly is built for teams, startups, and creators of all sizes. You can host meetings, manage team channels, and even integrate with your favorite tools. Whether you’re a solo creator or a 50-person company, Chatly adapts to your workflow.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. Your messages are encrypted end-to-end, and we use industry-standard security to protect your data. We’ll never sell your information or show ads — privacy is at the core of Chatly’s design philosophy.',
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
        <h2 className='text-3xl font-semibold mb-6'>
          Start chatting instantly with your team — for free.
        </h2>
        <Button asChild size='lg'>
          <Link href='/signup'>Get Started</Link>
        </Button>
      </section>
    </main>
  )
}
