# Fault-Finding Simulator

This project is an interactive browser-based exercise for learning how to diagnose faults in a routing system. It presents the user with a network of devices, real-time test results, and a form to submit the suspected faulty device. Scenarios are described in simple YAML files so that new troubleshooting exercises can easily be created.

## Features

- **Dynamic topology diagrams** rendered with Mermaid
- **Device legend** explaining every component in the scenario
- **Scenario loader** allowing multiple exercises and custom uploads
- **Step-by-step hints** to guide beginners
- **Server-side validation** of the user's answer

## Project Structure

```
├── Dockerfile             # Container build instructions
├── docker-compose.yml     # Optional compose setup (runs on port 7777)
├── server.js              # Express application serving the game and API endpoints
├── public/                # Front‑end files
│   ├── index.html         # User interface
│   ├── script.js          # Front‑end logic and hint system
│   └── styles.css         # Styling
├── scenarios/             # YAML scenario files (default provided)
│   └── default.yaml
└── package.json           # Node dependencies and scripts
```

### Scenarios

A scenario file describes all content shown in the UI. The example in `scenarios/default.yaml` defines:

- `title` – page heading
- `overview` – introduction text
- `devices` – list of device IDs, names and descriptions
- `topology` – Mermaid diagram syntax
- `paths` – summary of the traffic flows
- `test_results` – observed behaviours for the user to analyse
- `hints` – progressive hints displayed on request
- `validation` – the correct answer and feedback messages

Uploading a YAML file via the scenario menu will make a new exercise immediately available.

### API Endpoints

The backend in `server.js` exposes several endpoints:

- `GET /api/scenarios` – list of scenario names and the default one
- `GET /api/scenario?name=<id>` – full scenario data
- `POST /api/scenario/upload` – upload a new YAML scenario (multipart form field `file`)
- `POST /api/validate` – validate the selected device for a scenario

Static files in `public/` are served at the root path.

## Running the Application

### With Docker Compose

```bash
# build image and run on http://localhost:7777
docker-compose up -d
```

Stop the containers using `docker-compose down`.

### Local Development

```bash
npm install               # install dependencies
npm run dev               # start server with nodemon on http://localhost:3000
```

For production you can simply run `npm start`.

## Contributing

1. Fork the repository and create a branch for your changes
2. Run the app locally with Node or Docker to verify behaviour
3. Submit a pull request with a clear description of your improvements

## License

The project is released under the MIT License. See [LICENSE](LICENSE) for the full text.

