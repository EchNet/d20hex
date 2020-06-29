export const config = (key, dflt=undefined) => {
  const elements = document.querySelectorAll(`config[key="${key}"]`)
  if (elements && elements.length) {
    return elements[0].getAttribute("value")
  }
  return dflt;
}

export default config
