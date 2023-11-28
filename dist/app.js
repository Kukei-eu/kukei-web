const main = async () => {
  const versionRequest = await fetch('/api/version');
  const version = await versionRequest.text();
  
  const p = document.createElement('p');
  p.innerText = version;
  document.querySelector('body').appendChild(p);
}

main();