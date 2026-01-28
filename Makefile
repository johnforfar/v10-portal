# V10 Local Portal Orchestrator
# Runs all federated services locally for the V10 Mockup

PORT_PORTAL=3000
PORT_BUILDER=8501
PORT_COMMUNITY=3002
PORT_DOCS=3003
PORT_FRONTEND=3004

fix-portal:
	@echo "--- V10 Self-Healing Health Check ---"
	@lsof -i :$(PORT_PORTAL) > /dev/null || (echo "Restarting Portal..." && nohup ./node_modules/.bin/next dev -p $(PORT_PORTAL) > portal.log 2>&1 &)
	@lsof -i :$(PORT_BUILDER) > /dev/null || (echo "Restarting Builder..." && cd ../v10-local-builder && nohup ./scripts/start-studio.sh > ../v10-portal/builder.log 2>&1 &)
	@lsof -i :$(PORT_COMMUNITY) > /dev/null || (echo "Restarting Community..." && cd ../openxai-community/nextjs-app && nohup ./node_modules/.bin/next dev -p $(PORT_COMMUNITY) > ../../v10-portal/community.log 2>&1 &)
	@lsof -i :$(PORT_DOCS) > /dev/null || (echo "Restarting Docs..." && cd ../submodules/openxai-docs && nohup bun dev -- -p $(PORT_DOCS) > ../../v10-portal/docs.log 2>&1 &)
	@lsof -i :$(PORT_FRONTEND) > /dev/null || (echo "Restarting Dashboard Hub..." && cd ../submodules/openxai-frontend && nohup ./node_modules/.bin/next dev -p $(PORT_FRONTEND) > ../../v10-portal/marketplace.log 2>&1 &)
	@sleep 5
	@make status

test:
	@echo "Running V10 Platform Health Audit..."
	node scripts/health-check.js

.PHONY: start-portal stop-portal install-all check-ports status fix-portal logs test

check-ports:
	@echo "Checking for port conflicts..."
	@! lsof -ti:$(PORT_PORTAL),$(PORT_COMMUNITY),$(PORT_DOCS),$(PORT_FRONTEND) > /dev/null || (echo "Error: One or more ports are already in use. Run 'make stop-portal' first." && exit 1)

start-portal: check-ports
	@echo "--- Launching V10 Federated Platform ---"
	@echo "Portal Shell: http://localhost:$(PORT_PORTAL)"
	@echo "App Builder:  http://localhost:$(PORT_BUILDER) (Aider GUI)"
	@echo "Community:    http://localhost:$(PORT_COMMUNITY)"
	@echo "Docs (Bun):   http://localhost:$(PORT_DOCS)"
	@echo "Dashboard Hub: http://localhost:$(PORT_FRONTEND)"
	
	# 1. Start Docs (Native Bun Support)
	@cd ../submodules/openxai-docs && nohup bun dev -- -p $(PORT_DOCS) > ../../v10-portal/docs.log 2>&1 &
	
	# 2. Start Community
	@cd ../openxai-community/nextjs-app && nohup ./node_modules/.bin/next dev -p $(PORT_COMMUNITY) > ../../v10-portal/community.log 2>&1 &
	
	# 3. Start App Builder (Local Workstation)
	@cd ../v10-local-builder && nohup ./scripts/start-studio.sh > ../v10-portal/builder.log 2>&1 &
	
	# 4. Start Dashboard Hub (openxai-frontend)
	@cd ../submodules/openxai-frontend && nohup ./node_modules/.bin/next dev -p $(PORT_FRONTEND) > ../../v10-portal/marketplace.log 2>&1 &
	
	# 5. Start the Apex Portal Shell
	@nohup ./node_modules/.bin/next dev -p $(PORT_PORTAL) > portal.log 2>&1 &
	
	@echo "Services are initializing in background (Logs redirected to *.log)..."
	@echo "Running recursive health check (Max 2 minutes)..."
	@for i in $$(seq 1 24); do \
		sleep 5; \
		echo "Health Check Attempt $$i/24..."; \
		up_count=0; \
		lsof -i :$(PORT_PORTAL) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_BUILDER) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_COMMUNITY) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_DOCS) > /dev/null && up_count=$$((up_count + 1)); \
		lsof -i :$(PORT_FRONTEND) > /dev/null && up_count=$$((up_count + 1)); \
		if [ $$up_count -eq 5 ]; then \
			echo "SUCCESS: All 5 V10 services are ACTIVE."; \
			make status; \
			exit 0; \
		fi; \
		echo "Status: $$up_count/5 services up. Waiting..."; \
	done; \
	echo "WARNING: One or more services failed to bind within 2 minutes."; \
	make status

status:
	@echo "--- V10 Service Health Dashboard ---"
	@lsof -i :$(PORT_PORTAL) > /dev/null && echo "PORTAL (3000):    [UP]" || echo "PORTAL (3000):    [DOWN]"
	@lsof -i :$(PORT_BUILDER) > /dev/null && echo "DASHBOARD ($(PORT_BUILDER)):   [UP]" || echo "DASHBOARD ($(PORT_BUILDER)):   [DOWN]"
	@lsof -i :$(PORT_COMMUNITY) > /dev/null && echo "COMMUNITY (3002): [UP]" || echo "COMMUNITY (3002): [DOWN]"
	@lsof -i :$(PORT_DOCS) > /dev/null && echo "DOCS (3003):      [UP]" || echo "DOCS (3003):      [DOWN]"
	@lsof -i :$(PORT_FRONTEND) > /dev/null && echo "DASHBOARD HUB (3004): [UP]" || echo "DASHBOARD HUB (3004): [DOWN]"

stop-portal:
	@echo "Stopping all V10 services..."
	@lsof -ti:$(PORT_PORTAL),$(PORT_BUILDER),$(PORT_COMMUNITY),$(PORT_DOCS),$(PORT_FRONTEND) | xargs kill -9 > /dev/null 2>&1 || true

install-all:
	@echo "--- V10 Full Dependency Installation ---"
	@echo "[1/5] Installing Portal Apex..."
	@npm install --legacy-peer-deps && echo "      Portal Apex: [DONE]" || (echo "      Portal Apex: [FAILED]" && exit 1)
	@echo "[2/5] Installing Documentation Hub..."
	@cd ../submodules/openxai-docs && bun install && echo "      Docs Hub:    [DONE]" || (echo "      Docs Hub:    [FAILED]" && exit 1)
	@echo "[3/5] Installing Community Hub..."
	@cd ../openxai-community/nextjs-app && npm install --legacy-peer-deps && echo "      Community:   [DONE]" || (echo "      Community:   [FAILED]" && exit 1)
	@echo "[4/5] Installing App Builder (Local Workstation)..."
	@# Local workstation is a Nix environment, dependencies managed by flake.nix
	@echo "      App Builder: [SKIPPED - Managed by Nix]"
	@echo "[5/5] Installing Marketplace Service..."
	@cd ../submodules/openxai-frontend && npm install --legacy-peer-deps && echo "      Marketplace: [DONE]" || (echo "      Marketplace: [FAILED]" && exit 1)
	@echo "--- All dependencies installed successfully ---"
