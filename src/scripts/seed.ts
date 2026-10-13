import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb';
import Product from '../models/Product';
import Setting from '../models/Setting';

async function seed() {
  await connectToDatabase();
  console.log('Connected to DB...');

  await Product.deleteMany({});
  await Setting.deleteMany({});
  console.log('Cleared existing data...');

  await Product.create({
    name: 'Satin Tie Back Sleeveless Top',
    slug: 'satin-tie-back-sleeveless-top',
    description: 'Satin Tie Back Sleeveless Top in Black for Date Nights & Parties',
    price: 1200,
    category: 'ATELIER NOIR',
    images: ['/assets/template/images/product1.jpg'], // Using a local asset if available or placeholder
    is_active: true,
  });
  console.log('Product seeded...');

  await Setting.create({ key: 'site_name', value: 'ÉLANE' });
  console.log('Settings seeded...');

  process.exit(0);
}

seed();
