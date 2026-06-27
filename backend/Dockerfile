FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main .

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Copy templates
COPY templates/ ./templates/

# Expose port 8080 (Railway automatically assigns PORT, we just need to bind to it, default 8080)
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
