# Signal-Routing Troubleshooting Exercise

An interactive web application for diagnosing faults in signal-routing systems. Based on network topology analysis and behavioral testing, users identify which device is misconfigured or faulty.

## Scenario Overview

This troubleshooting simulator presents a **shared upstream architecture** where dynamic and static traffic flow through common components (AS→BH→GC→ZS) before diverging:

- **Dynamic Path**: ZS → DG → EB → IC₁/IC₂ → EM → KS
- **Static Path**: ZS → TF1 → TF2 → KS

Users must analyze test results showing that dynamic requests succeed end-to-end while static requests fail, despite all ping tests passing.

## Features

- 📋 **Interactive Device Legend** - Complete overview of all 12 system components
- 🗺️ **Visual System Topology** - Mermaid diagram showing shared upstream and divergent paths
- 🧪 **Test Results Analysis** - Real-time behavior observations and comprehensive ping results
- 🔍 **Diagnostic Interface** - Guided troubleshooting with validation
- 💡 **Progressive Hints** - Built-in hint system for learning the methodology
- 🎉 **Success Celebration** - Visual feedback for correct diagnoses

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone or download all files to a directory
# Ensure you have the following structure:
# ├── Dockerfile
# ├── docker-compose.yml
# ├── package.json
# ├── server.js
# ├── README.md
# └── public/
#     ├── index.html
#     ├── styles.css
#     └── script.js

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t signal-routing-troubleshooter .

# Run the container
docker run -d -p 3000:3000 --name signal-routing-app signal-routing-troubleshooter
```

### Development Mode

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

## Access the Application

Once running, open your browser and navigate to:
- **http://localhost:3000**

## How to Use

1. **Study the Device Legend** - Learn what each component does in the signal-routing system
2. **Examine the Topology** - Understand the shared upstream path and how traffic diverges
3. **Analyze Test Results** - Review dynamic vs static request outcomes and ping test results
4. **Apply Process of Elimination** - Use the fact that dynamic requests work to rule out devices
5. **Make Your Diagnosis** - Select the faulty device and explain your reasoning
6. **Get Feedback** - Receive immediate validation and detailed explanations

## System Requirements

- **Docker** 20.10+ and **Docker Compose** 2.0+ (recommended)
- OR **Node.js** 18+ for local development
- Modern web browser with JavaScript enabled

## Learning Objectives

This application teaches:
- **Shared Infrastructure Analysis** - Understanding how common upstream paths affect troubleshooting
- **Process of Elimination** - Using working traffic flows to rule out device failures
- **Traffic Flow Mapping** - Tracing different request types through network topology
- **Policy vs Connectivity Issues** - Distinguishing between physical and logical failures
- **Systematic Troubleshooting** - Following a methodical approach to fault isolation

## Technical Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript with Mermaid diagrams
- **Backend**: Node.js with Express
- **Containerization**: Docker with multi-stage optimization
- **Validation**: Server-side answer checking with detailed feedback

## File Structure

```
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-container orchestration
├── package.json            # Node.js dependencies
├── server.js               # Express backend
├── README.md               # This file
└── public/                 # Static web assets
    ├── index.html          # Main application page
    ├── styles.css          # Responsive styling
    └── script.js           # Interactive functionality
```

## Customization

To modify the troubleshooting scenario:

1. **Update Device Legend** - Edit the device grid in `index.html`
2. **Change Topology** - Modify the Mermaid diagram
3. **Adjust Test Results** - Update the observed behaviors section
4. **Modify Validation** - Change the correct answer in `server.js`

## Troubleshooting

### Container won't start
```bash
# Check if port 3000 is available
netstat -tlnp | grep 3000

# View detailed logs
docker-compose logs signal-routing-app
```

### Application not accessible
- Ensure Docker is running
- Verify port 3000 isn't blocked by firewall
- Check container status: `docker-compose ps`

### Performance issues
- Increase Docker memory allocation if needed
- Check system resources: `docker stats`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## License

MIT License - feel free to modify and distribute.

---

**Happy troubleshooting! 🔧**
