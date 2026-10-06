// import {Request, Response} from "express";
// import * as userController from "../controllers/user.controller.js";
// import * as userService from "../services/user.service.js";
//
// export const registration = (req: Request, res: Response) => {
//     const {name, email, password} = req.body;
//
//     try {
//         if (!name || !email || !password) {
//             return res.status(400).json({message: 'All fields are required'});
//         }
//
//         const userExists = userService.findByEmail(email);
//         if (userExists) {
//             return res.status(400).json({message: 'User already exists'});
//         }
//
//         const newUser = userController.createUser({name, email, password});
//         res.status(201).json({message: 'User registered successfully', user: newUser});
//     } catch (err) {
//         res.status(500).json({message: 'Server error'});
//     }
// }
