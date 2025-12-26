require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkRafflesImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    
    const db = client.db('ganacomivan2');
    const raffles = db.collection('raffles');
    
    // Obtener todas las rifas activas
    const activeRaffles = await raffles.find({ status: 'active' }).toArray();
    
    console.log(`\n📊 Total de rifas activas: ${activeRaffles.length}\n`);
    
    activeRaffles.forEach((raffle, index) => {
      console.log(`${index + 1}. ${raffle.title}`);
      console.log(`   ID: ${raffle._id}`);
      console.log(`   Imagen: ${raffle.image || 'NO TIENE IMAGEN'}`);
      console.log(`   Precio: $${raffle.ticketPrice}`);
      console.log(`   Fecha: ${raffle.drawDate}`);
      console.log('   ---');
    });
    
    // Contar rifas con y sin imagen
    const withImage = activeRaffles.filter(r => r.image && r.image.trim() !== '');
    const withoutImage = activeRaffles.filter(r => !r.image || r.image.trim() === '');
    
    console.log(`\n📈 Estadísticas:`);
    console.log(`   Con imagen: ${withImage.length}`);
    console.log(`   Sin imagen: ${withoutImage.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkRafflesImages();