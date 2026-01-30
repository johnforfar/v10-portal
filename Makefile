# V10 Local Portal Orchestrator
# Runs all federated services locally for the V10 Mockup

PORT_PORTAL=3000
PORT_BUILDER=3001
PORT_COMMUNITY=3002
PORT_DOCS=3003
PORT_DASHBOARD=3004
PORT_STATIC_HUB=3005
PORT_OLLAMA_PROXY=11435
PORT_VNC_BRIDGE=8502
PORT_VM_ENGINE=5900

# Central Logs Directory
ROOT_DIR=$(shell pwd)/..
LOG_DIR=$(ROOT_DIR)/logs

# Absolute paths for Nix reliability
SUBMODULES_PATH=$(ROOT_DIR)/submodules
BUILDER_PATH=$(ROOT_DIR)/v10-local-builder

# Security: Session UUID for unguessable URLs
SESSION_UUID=$(shell cat $(BUILDER_PATH)/.session_uuid 2>/dev/null || uuidgen | tee $(BUILDER_PATH)/.session_uuid)

restart: stop-portal start-portal

test-restart:
	@cd $(BUILDER_PATH) && ./scripts/test-session-reset.sh
	@make restart

init-logs:
	@mkdir -p $(LOG_DIR)
	@touch $(LOG_DIR)/portal.log $(LOG_DIR)/builder.log $(LOG_DIR)/community.log $(LOG_DIR)/docs.log $(LOG_DIR)/marketplace.log $(LOG_DIR)/ollama.log $(LOG_DIR)/microvm.log $(LOG_DIR)/vnc-bridge.log $(LOG_DIR)/static-hub.log
	@chmod +x $(BUILDER_PATH)/scripts/*.sh

fix-portal: init-logs
	@echo "--- V10 Self-Healing Health Check ---"
	@lsof -i :$(PORT_OLLAMA_PROXY) > /dev/null || (echo "Restarting Ollama Proxy..." && nohup node ../scripts/ollama-proxy.js > $(LOG_DIR)/ollama.log 2>&1 &)
	@lsof -i :$(PORT_PORTAL) > /dev/null || (echo "Restarting Portal..." && nohup ./node_modules/.bin/next dev -p $(PORT_PORTAL) > $(LOG_DIR)/portal.log 2>&1 &)
	@lsof -i :$(PORT_BUILDER) > /dev/null || (echo "Restarting Builder..." && cd $(BUILDER_PATH) && git add . && nohup nix develop . --override-input llm-agents $(SUBMODULES_PATH)/llm-agents.nix --impure --command ./scripts/start-studio.sh > $(LOG_DIR)/builder.log 2>&1 &)
	@lsof -i :$(PORT_COMMUNITY) > /dev/null || (echo "Restarting Community..." && cd ../openxai-community/nextjs-app && nohup ./node_modules/.bin/next dev -p $(PORT_COMMUNITY) > $(LOG_DIR)/community.log 2>&1 &)
	@lsof -i :$(PORT_DOCS) > /dev/null || (echo "Restarting Docs..." && cd ../submodules/openxai-docs && nohup bun dev -- -p $(PORT_DOCS) > $(LOG_DIR)/docs.log 2>&1 &)
	@lsof -i :$(PORT_DASHBOARD) > /dev/null || (echo "Restarting Dashboard..." && cd ../submodules/openxai-frontend && nohup ./node_modules/.bin/next dev -p $(PORT_DASHBOARD) > $(LOG_DIR)/marketplace.log 2>&1 &)
	@lsof -i :$(PORT_VNC_BRIDGE) > /dev/null || (echo "Restarting VNC Bridge..." && cd $(BUILDER_PATH) && nohup nix develop . --override-input llm-agents $(SUBMODULES_PATH)/llm-agents.nix --impure --command websockify $(PORT_VNC_BRIDGE) localhost:$(PORT_VM_ENGINE) > $(LOG_DIR)/vnc-bridge.log 2>&1 &)
	@sleep 5
	@make status

test:
	@echo "Running V10 Platform Health Audit..."
	node scripts/health-check.js

.PHONY: start-portal stop-portal restart install-all check-ports status fix-portal logs test init-logs

check-ports:
	@echo "Checking for port conflicts..."
	@! lsof -ti:$(PORT_PORTAL),$(PORT_BUILDER),$(PORT_COMMUNITY),$(PORT_DOCS),$(PORT_DASHBOARD),$(PORT_STATIC_HUB) > /dev/null || (echo "Error: One or more ports are already in use. Run 'make stop-portal' first." && exit 1)

start-portal: check-ports init-logs
	@echo "--- Launching V10 Federated Platform ---"
	@echo "Session ID:   $(SESSION_UUID)"
	@echo "Portal Shell: http://localhost:$(PORT_PORTAL)"
	@echo "App Builder:  http://localhost:$(PORT_BUILDER)"
	@echo "Static Hub:   http://localhost:$(PORT_STATIC_HUB)/$(SESSION_UUID)"
	@echo "Dashboard:    http://localhost:$(PORT_DASHBOARD)"
	
	# 0. Start Infrastructure Bridges
	@nohup node ../scripts/ollama-proxy.js > $(LOG_DIR)/ollama.log 2>&1 &
	
	# Nix Build & Bridge (Force git tracking for Flake visibility)
	@cd $(BUILDER_PATH) && git add . && nohup nix develop . --override-input llm-agents $(SUBMODULES_PATH)/llm-agents.nix --impure --command websockify $(PORT_VNC_BRIDGE) localhost:$(PORT_VM_ENGINE) > $(LOG_DIR)/vnc-bridge.log 2>&1 &
	
	# Start Native Display Server (Method 1) via the standard studio script
	@cd $(BUILDER_PATH) && ./scripts/start-app-native.sh > $(LOG_DIR)/static-hub.log 2>&1 &

	# 1. Start Docs (Native Bun Support)
	@cd $(SUBMODULES_PATH)/openxai-docs && nohup bun dev -- -p $(PORT_DOCS) > $(LOG_DIR)/docs.log 2>&1 &
	
	# 2. Start Community
	@cd $(ROOT_DIR)/openxai-community/nextjs-app && nohup ./node_modules/.bin/next dev -p $(PORT_COMMUNITY) > $(LOG_DIR)/community.log 2>&1 &
	
	# 3. Start App Builder (Local Workstation)
	@cd $(BUILDER_PATH) && git add . && nohup nix develop . --override-input llm-agents $(SUBMODULES_PATH)/llm-agents.nix --impure --command ./scripts/start-studio.sh > $(LOG_DIR)/builder.log 2>&1 &
	
	# 4. Start Dashboard Hub (openxai-frontend)
	@cd $(SUBMODULES_PATH)/openxai-frontend && nohup ./node_modules/.bin/next dev -p $(PORT_DASHBOARD) > $(LOG_DIR)/marketplace.log 2>&1 &
	
	# 5. Start the Apex Portal Shell
	@nohup ./node_modules/.bin/next dev -p $(PORT_PORTAL) > $(LOG_DIR)/portal.log 2>&1 &
	
	@echo "Services are initializing in background (Logs centralized in /logs/*.log)..."
	@echo "Running recursive health check (Max 2 minutes)..."
	@for i in $$(seq 1 24); do \
		sleep 5; \
		echo "Health Check Attempt $$i/24..."; \
		up_count=0; \
		lsof -i :$(PORT_PORTAL) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_BUILDER) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_COMMUNITY) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_DOCS) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_DASHBOARD) > /dev/null && up_count=$$((up_count + 1)); \
		if [ $$up_count -eq 5 ]; then \
			echo "SUCCESS: All 5 core V10 services are ACTIVE."; \
			make status; \
			exit 0; \
		fi; \
		echo "Status: $$up_count/5 core services up. Waiting..."; \
	done; \
	echo "WARNING: One or more services failed to bind within 2 minutes."; \
	make status

status:
	@echo "--- V10 Service Health Dashboard ---"
	@lsof -i :$(PORT_PORTAL) > /dev/null && echo "PORTAL (3000):      [UP]" || echo "PORTAL (3000):      [DOWN]"
	@lsof -i :$(PORT_BUILDER) > /dev/null && echo "BUILDER (3001):     [UP]" || echo "BUILDER (3001):     [DOWN]"
	@lsof -i :$(PORT_COMMUNITY) > /dev/null && echo "COMMUNITY (3002):   [UP]" || echo "COMMUNITY (3002):   [DOWN]"
	@lsof -i :$(PORT_DOCS) > /dev/null && echo "DOCS (3003):        [UP]" || echo "DOCS (3003):        [DOWN]"
	@lsof -i :$(PORT_DASHBOARD) > /dev/null && echo "DASHBOARD (3004):   [UP]" || echo "DASHBOARD (3004):   [DOWN]"
	@echo "-------------------------------------"
	@lsof -i :$(PORT_STATIC_HUB) > /dev/null && echo "STATIC HUB (3005):    [UP] (UUID: $(SESSION_UUID))" || echo "STATIC HUB (3005):    [DOWN]"
	@lsof -i :$(PORT_OLLAMA_PROXY) > /dev/null && echo "OLLAMA PROXY (11435): [UP]" || echo "OLLAMA PROXY (11435): [DOWN]"
	@lsof -i :$(PORT_VNC_BRIDGE) > /dev/null && echo "VNC BRIDGE (8502):    [UP]" || echo "VNC BRIDGE (8502):    [DOWN]"
	@lsof -i :$(PORT_VM_ENGINE) > /dev/null && echo "MICROVM ENGINE (5900): [UP]" || echo "MICROVM ENGINE (5900): [DOWN] (Waiting for build)"

stop-portal:
	@echo "Stopping all V10 services..."
	@lsof -ti:$(PORT_PORTAL),$(PORT_BUILDER),$(PORT_COMMUNITY),$(PORT_DOCS),$(PORT_DASHBOARD),$(PORT_OLLAMA_PROXY),$(PORT_VNC_BRIDGE),$(PORT_STATIC_HUB) | xargs kill -9 > /dev/null 2>&1 || true

install-all:
	@echo "--- V10 Full Dependency Installation ---"
	@echo "[1/5] Installing Portal Apex..."
	@npm install --legacy-peer-deps && echo "      Portal Apex: [DONE]" || (echo "      Portal Apex: [FAILED]" && exit 1)
	@echo "[2/5] Installing Documentation Hub..."
	@cd $(SUBMODULES_PATH)/openxai-docs && bun install && echo "      Docs Hub:    [DONE]" || (echo "      Docs Hub:    [FAILED]" && exit 1)
	@echo "[3/5] Installing Community Hub..."
	@cd $(ROOT_DIR)/openxai-community/nextjs-app && npm install --legacy-peer-deps && echo "      Community:   [DONE]" || (echo "      Community:   [FAILED]" && exit 1)
	@echo "[4/5] Installing App Builder (Local Workstation)..."
	@# Local workstation is a Nix environment, dependencies managed by flake.nix
	@echo "      App Builder: [SKIPPED - Managed by Nix]"
	@echo "[5/5] Installing Dashboard Service..."
	@cd $(SUBMODULES_PATH)/openxai-frontend && npm install --legacy-peer-deps && echo "      Dashboard:   [DONE]" || (echo "      Dashboard:   [FAILED]" && exit 1)
	@echo "--- All dependencies installed successfully ---"
