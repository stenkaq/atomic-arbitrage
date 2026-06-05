export function formatUrl(url: string, params: string[]): string {
  let formattedUrl = url;

  params.forEach((value, index) => {
    const placeholder = `{${index}}`;
    formattedUrl = formattedUrl.replaceAll(
      placeholder,
      encodeURIComponent(value),
    );
  });

  return formattedUrl;
}
