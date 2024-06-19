import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pg from 'pg';
import moment from 'moment';

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'phonebook_app',
    password: 'siva1222',
    port: 5432,
});


const createContact = async (name, phone) => {
    const result = await pool.query(
        'INSERT INTO contacts (name, phone) VALUES ($1, $2) RETURNING *',
        [name, phone]
    );
    return result.rows[0];
};

const getContacts = async () => {
    const result = await pool.query('SELECT * FROM contacts ORDER BY name');
    return result.rows.map(contact => ({
        ...contact,
        created_at: moment(contact.created_at).format('MMMM Do YYYY, h:mm:ss a'),
    }));
};

const updateContact = async (id, name, phone) => {
    const result = await pool.query(
        'UPDATE contacts SET name = $1, phone = $2 WHERE id = $3 RETURNING *',
        [name, phone, id]
    );
    return result.rows[0];
};

const deleteContact = async (id) => {
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

app.get('/', async (req, res) => {
    const contacts = await getContacts();
    res.render('index', { contacts });
});

app.post('/api/contacts/add', async (req, res) => {
    const { name, phone } = req.body;
    const contact = await createContact(name, phone);
    res.send(contact);
});

app.get('/api/contacts/all', async (req, res) => {
    const contacts = await getContacts();
    res.send(contacts);
});

app.put('/api/contacts/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;
    const contact = await updateContact(id, name, phone);
    res.send(contact);
});

app.delete('/api/contacts/delete/:id', async (req, res) => {
    const { id } = req.params;
    const contact = await deleteContact(id);
    if (contact) {
        res.send({ message: 'Contact deleted successfully' });
    } else {
        res.status(404).send({ message: 'Contact not found' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
