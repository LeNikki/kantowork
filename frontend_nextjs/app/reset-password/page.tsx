import ResetPasswordForm from "./reset-password-form";

// The token arrives in the query string, so this page reads it on the server and
// hands it to the client form as a plain prop. Doing it here rather than with
// useSearchParams() in the client form keeps the form out of a Suspense
// boundary, which useSearchParams would otherwise require for static rendering.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  // ?token=a&token=b is a valid URL; take the first rather than rendering
  // "[object Object]" or crashing.
  const value = Array.isArray(token) ? token[0] : token;

  return <ResetPasswordForm token={value ?? ""} />;
}