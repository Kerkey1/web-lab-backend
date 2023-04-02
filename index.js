const express = require("express");
const fs = require("fs");
const {check, validationResult} = require('express-validator');
const bodyParser = require('body-parser');
const app = express();

//Настройки сервера
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Константы
const dataLink = "./users.json"
const PORT = process.env.PORT || 3000;

//Логический слой
const readArrayFromFile = (path) => {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (err) {
        return err
    }
}

const updateArrayInFile = (path, newObject) => {
    const data = readArrayFromFile(dataLink);
    data.push(newObject)
    try {
        fs.writeFileSync(path, JSON.stringify(data), {flag: "w"})
        return (readArrayFromFile(dataLink))
    } catch (err) {
        return err
    }
}

//Запросы
app.post("/createUser", [
        check('name').exists().not().isEmpty(),
        check('phoneNumber').exists().not().isEmpty(),
    ],
    (req, res) => {

        try {
            validationResult(req).throw();  // ошибка валидации
        } catch (err) {
            res.sendStatus(422);
        }

        if (!req.body) return res.sendStatus(400);

        res.json(updateArrayInFile(dataLink, req.body))
    });

app.get("/getUsers", (req, res) => {
    res.json(readArrayFromFile(dataLink));
});

//Сервер
app.listen(PORT, () => {
    //Если файл не существует, то создается новый
    fs.access(dataLink, fs.constants.F_OK, (error) => {
        if (error) {
            fs.writeFileSync(dataLink, '', {flag: 'wx'}); //Создается пустой файл
            fs.writeFileSync(dataLink, '[]', {flag: 'w'}); //В файл добавляется пустой массив
            console.log('Файл создан!');
        } else
            console.log('Файл уже существует!')
    });
    console.log(`Порт: ${PORT}`);
});