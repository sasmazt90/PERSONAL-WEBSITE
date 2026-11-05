import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.title = "Privacy Policy | Claude Drive Uploader";

    return () => {
      document.title = previousTitle;
      meta.remove();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-12 text-[#17263a] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Claude Drive Uploader</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: November 5, 2026</p>

        <div className="mt-9 space-y-7 text-base leading-7">
          <section>
            <h2 className="text-xl font-semibold">1. Operator and scope</h2>
            <p className="mt-2">
              Claude Drive Uploader is a personal, non-commercial Google Drive API integration operated by
              Ibrahim Tolgar Sasmaz. This notice describes the Google account data handled by this
              integration. It does not serve as a general privacy policy for other features of sasmaz.digital.
              Contact: <a className="underline" href="mailto:sasmazt90@gmail.com">sasmazt90@gmail.com</a>.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. Google data accessed</h2>
            <p className="mt-2">
              With the Google account holder's authorization, the integration requests Google Drive
              permissions needed to create or upload files and access files it creates or that the user
              explicitly opens with the integration (Google Drive API's drive.file scope). It may process
              filenames, file identifiers, MIME types, sizes, destination folder identifiers and upload status
              to complete and verify transfers. It does not request access to Gmail, contacts or calendars.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. Purpose and use</h2>
            <p className="mt-2">
              Authorized Google Drive data is used solely to transfer user-requested files from a cloud
              working environment to the authorized Google Drive account, verify upload completion and return
              file links. It is not used for advertising, profiling, model training or sale of personal data.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Storage and service providers</h2>
            <p className="mt-2">
              Uploaded files are stored in the user's Google Drive under Google's storage terms. The
              integration may temporarily process file bytes and upload metadata in the cloud service that
              performs the transfer. Where persistent OAuth credentials are required, they should be kept in
              access-restricted secrets storage, not in website frontend code. Google and the selected cloud
              infrastructure provider process information required to provide their services. Actual retention
              of temporary upload data depends on the deployed transfer service's configuration; the service
              should remove temporary copies when no longer needed for transfer or troubleshooting.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Sharing and limited use</h2>
            <p className="mt-2">
              Google user data is not sold, shared with advertisers or used for unrelated purposes.
              Information is transmitted to Google Drive and to infrastructure strictly necessary to perform
              an authorized transfer. Access and use of Google user data follows the Google API Services User
              Data Policy, including its Limited Use requirements.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">6. Control and revocation</h2>
            <p className="mt-2">
              The account holder controls uploaded files in Google Drive and may revoke the integration's
              access at any time through Google Account &gt; Security &gt; Third-party connections. They
              may also request deletion of any integration-managed temporary data or credentials by contacting
              the operator. Revoking access prevents further API operations but does not automatically delete
              files already uploaded to Drive.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">7. Security and international processing</h2>
            <p className="mt-2">
              API requests use encrypted HTTPS connections. Credentials should be restricted to authorized
              services and rotated or revoked if compromised. Cloud providers may process information in
              countries outside the user's country, subject to their respective safeguards and terms.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">8. Changes and contact</h2>
            <p className="mt-2">
              This notice may be updated when the integration's functionality or data practices change.
              The effective date above will be revised accordingly. For privacy inquiries contact
              <a className="ml-1 underline" href="mailto:sasmazt90@gmail.com">sasmazt90@gmail.com</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
