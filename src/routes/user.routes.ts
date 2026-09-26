import {Router} from "express";
import * as userController from '../controllers/user.controller.js';

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 9b907f1d-0fb0-43bc-bc87-4e538ba5958b
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         name:
 *           type: string
 *           example: John Doe
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-26T07:34:07.777Z
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: User not found
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *               example:
 *                 - id: 9b907f1d-0fb0-43bc-bc87-4e538ba5958b
 *                   email: johndoe@example.com
 *                   name: John Doe
 *                   createdAt: 2026-09-26T07:34:07.777Z
 *                 - id: 059e45d5-4f4c-4d8a-9cc3-cfb4110ea365
 *                   email: alexfrost@example.com
 *                   name: Alex Frost
 *                   createdAt: 2026-09-26T07:34:34.948Z
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: {userId}
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user's id
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:userId', userController.getUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 9b907f1d-0fb0-43bc-bc87-4e538ba5958b
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: johndoe@example.com
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 createdAt:
 *                    type: string
 *                    format: date-time
 *                    example: 2026-09-26T07:34:07.777Z
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', userController.createUser);

/**
 * paths:
 *   /users/{id}:
 *     patch:
 *       summary: Update specific user fields
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *       responses:
 *         '200':
 *           description: Successfully updated
 *         422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *         404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:userId', userController.updateUser);

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     responses:
 *       204:
 *         description: User delete successfully
 *         content:
 *           application/json:
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:userId', userController.deleteUser);

export default router;