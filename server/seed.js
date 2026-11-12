
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

function seed() {
  const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
  const password = bcrypt.hashSync('resq123', 8); 

  // ---------- Users ----------
  const users = [
    { id: 1, name: 'Anitha Menon', email: 'coordinator@resq.in', phone: '+91 94470 00001', role: 'coordinator', password },
  ];
  const volunteers = [
    ['Arjun Nair', 11.6085, 76.083, ['rescue', 'swimming']],
    ['Fathima Rahman', 11.5995, 76.0915, ['medical', 'first-aid']],
    ['Joseph Thomas', 11.5615, 76.1245, ['logistics', 'food']],
    ['Meera Krishnan', 11.6215, 76.0705, ['first-aid', 'general']],
    ['Rahul Varma', 11.5525, 76.0425, ['rescue', 'shelter']],
    ['Sneha Pillai', 11.8, 76.0065, ['medical']],
  ];
  volunteers.forEach(([name, lat, lng, skills], i) => {
    users.push({
      id: 2 + i, name, email: `volunteer${i + 1}@resq.in`, phone: `+91 94470 1000${i}`,
      role: 'volunteer', password, available: true, skills, lat, lng,
    });
  });
  ['Lakshmi Devi', 'Mohammed Ashraf', 'Thankamma Joseph', 'Biju Kurian'].forEach((name, i) => {
    users.push({
      id: 10 + i, name, email: `citizen${i + 1}@resq.in`, phone: `+91 98950 2000${i}`,
      role: 'citizen', password,
    });
  });

  // ---------- Requests ----------
  const requests = [
    { userId: 10, type: 'rescue', urgency: 5, peopleCount: 6, elderly: true, children: true, patients: false, description: 'Water entering the ground floor. Family stuck upstairs.', lat: 11.5545, lng: 76.134, status: 'pending', created: 95 },
    { userId: 11, type: 'medicine', urgency: 4, peopleCount: 2, elderly: true, children: false, patients: true, description: 'Insulin and BP tablets finished. Road is blocked.', lat: 11.5925, lng: 76.0905, status: 'pending', created: 150 },
    { userId: 12, type: 'food', urgency: 3, peopleCount: 12, elderly: false, children: true, patients: false, description: 'Twelve people in a community hall with no food since morning.', lat: 11.6655, lng: 76.2555, status: 'pending', created: 40 },
    { userId: 13, type: 'shelter', urgency: 4, peopleCount: 8, elderly: true, children: false, patients: false, description: 'House damaged by landslide. Need a safe place for tonight.', lat: 11.552, lng: 76.0445, status: 'pending', created: 70 },
    { userId: 10, type: 'food', urgency: 2, peopleCount: 4, elderly: false, children: false, patients: false, description: 'Need drinking water and rice for two days.', lat: 11.6225, lng: 76.0715, status: 'pending', created: 25 },
    { userId: 11, type: 'rescue', urgency: 5, peopleCount: 3, elderly: false, children: false, patients: true, description: 'Patient must be moved to hospital. Vehicle cannot reach.', lat: 11.6005, lng: 76.0805, status: 'assigned', volunteer: 2, assignedAfter: 12, created: 55 },
    { userId: 12, type: 'medicine', urgency: 3, peopleCount: 1, elderly: true, children: false, patients: false, description: 'Needs an oxygen cylinder refill.', lat: 11.8015, lng: 76.0075, status: 'in_progress', volunteer: 7, assignedAfter: 20, created: 200 },
    { userId: 13, type: 'food', urgency: 2, peopleCount: 5, elderly: false, children: false, patients: false, description: 'Dry rations delivered. Thank you!', lat: 11.5875, lng: 76.1015, status: 'resolved', volunteer: 4, assignedAfter: 25, resolvedAfter: 140, created: 600 },
    { userId: 10, type: 'shelter', urgency: 3, peopleCount: 6, elderly: false, children: true, patients: false, description: 'Family moved to the Kalpetta camp.', lat: 11.6105, lng: 76.0865, status: 'resolved', volunteer: 5, assignedAfter: 18, resolvedAfter: 210, created: 900 },
  ].map((r, i) => {
    const volunteer = users.find((u) => u.id === r.volunteer);
    const createdAt = minutesAgo(r.created);
    const plus = (min) => new Date(new Date(createdAt).getTime() + min * 60000).toISOString();
    const request = {
      id: i + 1, userId: r.userId, userName: users.find((u) => u.id === r.userId).name,
      phone: users.find((u) => u.id === r.userId).phone,
      type: r.type, urgency: r.urgency, peopleCount: r.peopleCount,
      elderly: r.elderly, children: r.children, patients: r.patients,
      description: r.description, lat: r.lat, lng: r.lng, status: r.status,
      assignedTo: volunteer ? volunteer.id : null, assignedName: volunteer ? volunteer.name : null,
      createdAt,
    };
    if (volunteer) request.assignedAt = plus(r.assignedAfter);
    if (r.resolvedAfter) request.resolvedAt = plus(r.resolvedAfter);
    return request;
  });

  // ---------- Camps and stock ----------
  const camps = [
    { id: 1, name: 'GVHSS Meppadi Relief Camp', lat: 11.553, lng: 76.133, capacity: 300, occupancy: 214 },
    { id: 2, name: 'Kalpetta Town Hall Camp', lat: 11.6095, lng: 76.0845, capacity: 180, occupancy: 96 },
    { id: 3, name: 'Mananthavady Community Hall', lat: 11.8014, lng: 76.004, capacity: 120, occupancy: 41 },
  ];
  // usePerPersonPerHour 
  const inventory = [
    { id: 1, campId: 1, item: 'Rice', unit: 'kg', quantity: 420, usePerPersonPerHour: 0.12 },
    { id: 2, campId: 1, item: 'Drinking water', unit: 'L', quantity: 1400, usePerPersonPerHour: 0.3 },
    { id: 3, campId: 1, item: 'Medicine kits', unit: 'kits', quantity: 18, usePerPersonPerHour: 0.015 },
    { id: 4, campId: 2, item: 'Rice', unit: 'kg', quantity: 900, usePerPersonPerHour: 0.12 },
    { id: 5, campId: 2, item: 'Drinking water', unit: 'L', quantity: 380, usePerPersonPerHour: 0.3 },
    { id: 6, campId: 3, item: 'Rice', unit: 'kg', quantity: 700, usePerPersonPerHour: 0.12 },
  ];

  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify({ users, requests, camps, inventory }, null, 2));
  console.log('Demo data created: db.json');
}

module.exports = seed;
if (require.main === module) seed();
