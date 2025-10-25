import Link from 'next/link'

export default function Page() {
  return (
    <div className='min-h-svh bg-muted flex flex-col items-center justify-start py-12 px-4'>
      <div className='w-full max-w-7xl bg-background p-8 md:p-12 rounded-2xl shadow-sm space-y-8'>
        <header className='text-center space-y-2'>
          <h1 className='text-3xl font-bold'>Privacy Policy</h1>
          <p className='text-sm text-muted-foreground'>
            Last updated: October 24, 2025
          </p>
        </header>

        <section className='space-y-2'>
          <p>
            This Privacy Policy describes Our policies and procedures on the
            collection, use and disclosure of Your information when You use the
            Service and tells You about Your privacy rights and how the law
            protects You.
          </p>
          <p>
            We use Your Personal data to provide and improve the Service. By
            using the Service, You agree to the collection and use of
            information in accordance with this Privacy Policy. This Privacy
            Policy has been created with the help of the Privacy Policy
            Generator.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Interpretation and Definitions
          </h2>

          <h3 className='font-semibold'>Interpretation</h3>
          <p>
            The words whose initial letters are capitalized have meanings
            defined under the following conditions. These definitions apply
            whether they appear in singular or plural.
          </p>

          <h3 className='font-semibold'>Definitions</h3>
          <ul className='list-disc list-inside space-y-1'>
            <li>
              <strong>Account:</strong> a unique account created for You to
              access our Service or parts of our Service.
            </li>
            <li>
              <strong>Affiliate:</strong> an entity that controls, is controlled
              by, or is under common control with a party (50% or more
              ownership).
            </li>
            <li>
              <strong>Company:</strong> Chatly, referred to as &quot;We&quot;,
              &quot;Us&quot;, or &quot;Our&quot;.
            </li>
            <li>
              <strong>Cookies:</strong> small files placed on Your device
              containing browsing information.
            </li>
            <li>
              <strong>Country:</strong> Telangana, India
            </li>
            <li>
              <strong>Device:</strong> any device that can access the Service.
            </li>
            <li>
              <strong>Personal Data:</strong> any information that relates to an
              identified or identifiable individual.
            </li>
            <li>
              <strong>Service:</strong> refers to the Website.
            </li>
            <li>
              <strong>Service Provider:</strong> a third-party processing data
              on behalf of the Company.
            </li>
            <li>
              <strong>Usage Data:</strong> data collected automatically from the
              Service or its infrastructure.
            </li>
            <li>
              <strong>Website:</strong> Chatly, accessible from{' '}
              <Link
                href='https://chatly-brown.vercel.app'
                className='underline'
              >
                https://chatly-brown.vercel.app
              </Link>
            </li>
            <li>
              <strong>You:</strong> the individual or entity accessing the
              Service.
            </li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Collecting and Using Your Personal Data
          </h2>

          <h3 className='font-semibold'>Types of Data Collected</h3>
          <p>
            We may ask You to provide personally identifiable information,
            including:
          </p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Usage Data</li>
          </ul>

          <h3 className='font-semibold'>Usage Data</h3>
          <p>
            Usage Data is collected automatically when using the Service,
            including your IP address, browser type, pages visited, visit
            duration, and device information.
          </p>

          <h3 className='font-semibold'>Tracking Technologies and Cookies</h3>
          <p>
            We use Cookies, Web Beacons, and similar technologies to monitor
            activity and improve the Service.
          </p>
          <ul className='list-disc list-inside space-y-1'>
            <li>
              <strong>Cookies or Browser Cookies:</strong> small files on your
              device. You can refuse cookies, but some parts of the Service may
              not work.
            </li>
            <li>
              <strong>Web Beacons:</strong> small electronic files to track page
              visits or email opens.
            </li>
            <li>
              <strong>Persistent Cookies:</strong> remain on your device
              offline.
            </li>
            <li>
              <strong>Session Cookies:</strong> deleted when the browser is
              closed.
            </li>
          </ul>
          <p>
            We use cookies for authentication, user preferences, and consent
            tracking.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Use of Your Personal Data</h2>
          <p>We may use Personal Data for:</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Providing and maintaining our Service</li>
            <li>Managing your Account</li>
            <li>Performance of contracts</li>
            <li>Contacting you regarding updates and offers</li>
            <li>Business analysis and improvements</li>
            <li>Legal compliance and business transfers</li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Sharing Your Personal Data</h2>
          <ul className='list-disc list-inside space-y-1'>
            <li>Service Providers</li>
            <li>Business transfers or mergers</li>
            <li>Affiliates</li>
            <li>Business partners</li>
            <li>Other users (public interactions)</li>
            <li>With your consent</li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Retention of Your Personal Data
          </h2>
          <p>
            We retain Personal Data only as long as necessary for legal
            obligations, disputes, and improving the Service. Usage Data may be
            retained longer for security or functionality purposes.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Transfer of Your Personal Data
          </h2>
          <p>
            Your information may be transferred and stored in jurisdictions with
            different data protection laws. We take reasonable steps to ensure
            data security during transfers.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Delete Your Personal Data</h2>
          <p>
            You can delete or request deletion of your Personal Data via account
            settings or by contacting us. Some data may be retained for legal
            obligations.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Disclosure of Your Personal Data
          </h2>
          <p>May be disclosed for:</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Business Transactions (mergers, sales)</li>
            <li>Law Enforcement</li>
            <li>
              Other legal requirements to protect rights, property, or safety
            </li>
          </ul>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Security of Your Personal Data
          </h2>
          <p>
            We use commercially reasonable means to protect your Personal Data,
            but no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Children&apos;s Privacy</h2>
          <p>
            The Service does not address anyone under 13. Contact us if your
            child has provided Personal Data so we can remove it.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Links to Other Websites</h2>
          <p>
            We are not responsible for third-party websites. Review their
            privacy policies when visiting external links.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Policy. Updates will be posted here, with the
            &quot;Last updated&quot; date changed. Review periodically for
            changes.
          </p>
        </section>

        <section className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Contact Us</h2>
          <p>
            Questions? Contact us via:{' '}
            <Link
              href='https://chatly-brown.vercel.app/privacy'
              className='underline'
            >
              https://chatly-brown.vercel.app/privacy
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
