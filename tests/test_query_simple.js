const BACKEND_URL = 'http://localhost:8080';

fetch(`${BACKEND_URL}/products?limit=10`)
    .then(r => r.json())
    .then(d => {
        console.log('Total:', d.total || 0);
        console.log('Items:', d.items?.length || 0);
        if (d.items && d.items.length > 0) {
            console.log('✅ SUCCESS! Products visible!');
            d.items.slice(0, 3).forEach((p, i) => {
                console.log(`  ${i+1}. ${p.name}`);
            });
        }
    })
    .catch(e => console.error('Error:', e.message));

