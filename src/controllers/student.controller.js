import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Student management
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 */
export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Comma-separated list of relations to populate (courses)
 *     responses:
 *       200:
 *         description: List of students
 */
export const getAllStudents = async (req, res) => {
    // Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
    // Sorting
    const sort = req.query.sort || 'desc';
    const order = [['createdAt', sort.toUpperCase()]];
    
    // Populate/Include relations
    const populate = req.query.populate;
    let include = [];
    
    if (populate) {
        const relations = populate.split(',').map(rel => rel.trim());
        relations.forEach(relation => {
            switch (relation.toLowerCase()) {
                case 'courses':
                    include.push(db.Course);
                    break;
                default:
                    break;
            }
        });
    }

    try {
        const total = await db.Student.count();
        
        const students = await db.Student.findAll({
            include: include,
            limit: limit,
            offset: (page - 1) * limit,
            order: order
        });
        
        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                sort: sort,
                populate: populate || null
            },
            data: students,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Comma-separated list of relations to populate (courses)
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Not found
 */
export const getStudentById = async (req, res) => {
    // Populate/Include relations
    const populate = req.query.populate;
    let include = [];
    
    if (populate) {
        const relations = populate.split(',').map(rel => rel.trim());
        relations.forEach(relation => {
            switch (relation.toLowerCase()) {
                case 'courses':
                    include.push(db.Course);
                    break;
                default:
                    break;
            }
        });
    } else {
        // Default include all relations for single item
        include = [db.Course];
    }

    try {
        const student = await db.Student.findByPk(req.params.id, { include: include });
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Student updated
 */
export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Student deleted
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};