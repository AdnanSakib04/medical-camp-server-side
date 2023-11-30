const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4bcdgb.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db("careSyncDB").collection("users");
        const campCollection = client.db("careSyncDB").collection("camps");
        const healthcareProfessionalCollection = client.db("careSyncDB").collection("healthcareProfessional");
        const participantCollection = client.db("careSyncDB").collection("participants");
        const organizerCollection = client.db("careSyncDB").collection("organizers");
        const registerCampCollection = client.db("careSyncDB").collection("registerCamp");
        const upcomingCampCollection = client.db("careSyncDB").collection("upcomingCamp");
        const paymentCollection = client.db("careSyncDB").collection("payments");

        //to insert new users into the collection
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        //to insert new users into the healthcare collection
        app.post('/healthcareProfessional', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await healthcareProfessionalCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await healthcareProfessionalCollection.insertOne(user);
            res.send(result);
        });

        //to insert new users into the participant collection
        app.post('/participant', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await participantCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await participantCollection.insertOne(user);
            res.send(result);
        });
        //to insert new users into the participant collection
        app.post('/organizer', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await organizerCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await organizerCollection.insertOne(user);
            res.send(result);
        });

        //to get data from healthcare collection
        app.get('/get-healthcareProfessional-data', async (req, res) => {

            const userEmail = req.query.email;


            const userData = await healthcareProfessionalCollection.findOne({ email: userEmail });

            if (!userData) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(userData);
            }

        });

        //to get data from participant collection
        app.get('/get-participant-data', async (req, res) => {

            const userEmail = req.query.email;


            const userData = await participantCollection.findOne({ email: userEmail });

            if (!userData) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(userData);
            }

        });
        //to get data from organizer collection
        app.get('/get-organizer-data', async (req, res) => {

            const userEmail = req.query.email;


            const userData = await organizerCollection.findOne({ email: userEmail });

            if (!userData) {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.json(userData);
            }

        });

        //put route for update healthcare profile
        app.put('/update-healthcare-profile/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedProfile = req.body;

            const blog = {
                $set: {
                    name: updatedProfile.name,
                    phone: updatedProfile.phone,
                    specialty: updatedProfile.specialty,
                    certifications: updatedProfile.certifications,
                    email: updatedProfile.email,
                    address: updatedProfile.address,
                }
            }

            const result = await healthcareProfessionalCollection.updateOne(filter, blog, options);
            res.send(result);
        })

        //put route for update participant profile
        app.put('/update-participant-profile/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedProfile = req.body;

            const blog = {
                $set: {
                    name: updatedProfile.name,
                    phone: updatedProfile.phone,
                    preferences: updatedProfile.preferences,
                    interests: updatedProfile.interests,
                    email: updatedProfile.email,
                    address: updatedProfile.address,
                }
            }

            const result = await participantCollection.updateOne(filter, blog, options);
            res.send(result);
        })
        //put route for update organizer profile
        app.put('/update-organizer-profile/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedProfile = req.body;

            const blog = {
                $set: {
                    name: updatedProfile.name,
                    phone: updatedProfile.phone,
                    preferences: updatedProfile.preferences,
                    email: updatedProfile.email,
                    address: updatedProfile.address,
                }
            }

            const result = await organizerCollection.updateOne(filter, blog, options);
            res.send(result);
        })


        //post route to add a camp
        app.post('/add-a-camp', async (req, res) => {
            const item = req.body;
            const result = await campCollection.insertOne(item);
            res.send(result);
        });


        //post route to add a registration for camp
        app.post('/register-camp', async (req, res) => {
            const item = req.body;
            const result = await registerCampCollection.insertOne(item);
            res.send(result);
        });


        //to retrieve all camps
        app.get('/available-camps', async (req, res) => {
            const result = await campCollection.find().toArray();
            res.send(result);
        });

        //get route for camps of specific organizer
        app.get('/available-camps/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const filter = { organizerEmail: email };
                const camps = await campCollection.find(filter).toArray();
                res.json(camps);
            } catch (error) {
                console.error('Error fetching camps:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        //get route for registered camps of specific participant
        app.get('/registered-camps/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const filter = { email: email };
                const camps = await registerCampCollection.find(filter).toArray();
                res.json(camps);
            } catch (error) {
                console.error('Error fetching camps:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        //get route for managing registered camps of specific organizer
        app.get('/manage-registered-camps/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const filter = { organizerEmail: email };
                const camps = await registerCampCollection.find(filter).toArray();
                res.json(camps);
            } catch (error) {
                console.error('Error fetching camps:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        //delete route for registration cancelation of specific participant
        app.delete('/registered-camps/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await registerCampCollection.deleteOne(query);
            res.send(result);
        })


        // Endpoint to get user role based on email
        app.get('/user-role', async (req, res) => {
            try {
                const { email } = req.query;

                const user = await userCollection.findOne({ email });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({ role: user.role });
            } catch (error) {
                console.error('Error fetching user role:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        //delete route for camp
        app.delete('/delete-camp/:campId', async (req, res) => {
            const id = req.params.campId;
            const query = { _id: new ObjectId(id) }
            const result = await campCollection.deleteOne(query);
            res.send(result);
        })



        //get route for update camp
        app.get('/available-camps/:campId', async (req, res) => {
            const id = req.params.campId;
            const query = { _id: new ObjectId(id) }
            const result = await campCollection.findOne(query);
            res.send(result);
        })

        //put route for update camp
        app.put('/update-camp/:campId', async (req, res) => {
            const id = req.params.campId;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCamp = req.body;

            const camp = {
                $set: {
                    name: updatedCamp.name,
                    audience: updatedCamp.audience,
                    photo: updatedCamp.photo,
                    description: updatedCamp.description,
                    fees: updatedCamp.fees,
                    location: updatedCamp.location,
                    dateTime: updatedCamp.dateTime,
                    specializedServices: updatedCamp.specializedServices,
                    healthcareProfessionals: updatedCamp.healthcareProfessionals
                }
            }

            const result = await campCollection.updateOne(filter, camp, options);
            res.send(result);
        })

        //post route to add a camp
        app.post('/add-upcoming-camp', async (req, res) => {
            const item = req.body;
            const result = await upcomingCampCollection.insertOne(item);
            res.send(result);
        });


        //to retrieve all camps
        app.get('/upcoming-camps', async (req, res) => {
            const result = await upcomingCampCollection.find().toArray();
            res.send(result);
        });

        // payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount, 'amount inside the intent')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });

        //to retrieve all registered camps
        app.get('/registered-camps', async (req, res) => {
            const result = await registerCampCollection.find().toArray();
            res.send(result);
        });

        //post route to add a camp
        app.post('/payments', async (req, res) => {
            const item = req.body;
            const result = await paymentCollection.insertOne(item);
            res.send(result);
        });

        //get route for payment history of participants
        app.get('/payments/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const filter = { email: email };
                const camps = await paymentCollection.find(filter).toArray();
                res.json(camps);
            } catch (error) {
                console.error('Error fetching camps:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        //patch route for updating status of participants registered camps
        app.patch('/registered-camp/:id', async (req, res) => {
            const item = req.body;
            console.log('Received Update Status:', item);
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paymentStatus: item.paymentStatus,
                }
            };

            try {
                const result = await registerCampCollection.updateOne(filter, updatedDoc);
                console.log('Update Result:', result);
                res.send(result);
            } catch (error) {
                console.error('Error updating payment status:', error);
                res.status(500).send({ message: 'Error updating payment status' });
            }
        });





        //patch route for updating confirmation status of participants registered camps
        app.patch('/registered-camp-organizer/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    confirmationStatus: item.confirmationStatus,

                }
            }
            const result = await registerCampCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })




        //patch route for updating confirmation status in payment history
        app.patch('/payment-history-status/:id', async (req, res) => {
            const item = req.body;
            const id = req.params.id;
            const filter = { campId: id }
            const updatedDoc = {
                $set: {
                    confirmationStatus: item.confirmationStatus,

                }
            }
            const result = await paymentCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        //to retrieve all participants camps
        app.get('/user-list', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        // -------------------------------------------------------------------------------
        // -------------------------------------------------------------------------------

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Care Sync server is running')
})

app.listen(port, () => {
    console.log(`Care Sync server is running on port ${port}`);
})

