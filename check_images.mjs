import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1544062088-75540fbaff32?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1600080302484-fe81df96cbbf?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1434493789847-2f02b0c4e20b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1649859398021-afbbf80a6144?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426fac365?auto=format&fit=crop&w=400&q=80'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => {
      resolve({ url, status: 'error' });
    });
  });
}

async function main() {
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`${res.status} - ${res.url}`);
  }
}

main();
