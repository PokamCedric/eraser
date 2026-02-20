/**
 * Canvas Interaction Handler
 *
 * Handles mouse events for canvas (drag entities, pan, zoom).
 * Single Responsibility: user input handling only
 */

import { Entity } from '../../domain/entities/Entity';
import { Position } from '../../domain/value-objects/Position';
import { ViewportManager } from './ViewportManager';

interface MousePosition {
  x: number;
  y: number;
}

export class CanvasInteractionHandler {
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private dragEntity: Entity | null = null;
  private dragOffset: MousePosition = { x: 0, y: 0 };
  private lastMousePos: MousePosition = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private mouseDownPos: MousePosition = { x: 0, y: 0 };
  private hasMoved: boolean = false;
  private static readonly CLICK_THRESHOLD = 5; // pixels

  // Stored bound references so removeEventListener can match them exactly
  private _boundMouseDown: (e: MouseEvent) => void;
  private _boundMouseMove: (e: MouseEvent) => void;
  private _boundMouseUp: (e?: MouseEvent) => void;
  private _boundWheel: (e: WheelEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private viewportManager: ViewportManager,
    private onRender: () => void,
    private getEntities: () => Entity[],
    private getEntityPositions: () => Map<string, Position>,
    private updateEntityPosition: (entityName: string, position: Position) => void,
    private isPointInEntity: (x: number, y: number) => Entity | null,
    private onEntityClick?: (entity: Entity, worldX: number, worldY: number, screenX: number, screenY: number) => boolean | void,
    private onBackgroundClick?: () => void
  ) {
    this._boundMouseDown = this.handleMouseDown.bind(this);
    this._boundMouseMove = this.handleMouseMove.bind(this);
    this._boundMouseUp = this.handleMouseUp.bind(this);
    this._boundWheel = this.handleWheel.bind(this);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this._boundMouseDown);
    this.canvas.addEventListener('mousemove', this._boundMouseMove);
    this.canvas.addEventListener('mouseup', this._boundMouseUp);
    this.canvas.addEventListener('mouseleave', this._boundMouseUp);
    this.canvas.addEventListener('wheel', this._boundWheel);
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isMouseDown = true;
    this.hasMoved = false;
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    const rect = this.canvas.getBoundingClientRect();
    const worldPos = this.viewportManager.screenToWorld(e.clientX, e.clientY, rect);
    const clickedEntity = this.isPointInEntity(worldPos.x, worldPos.y);

    if (clickedEntity) {
      this.isDragging = true;
      this.isPanning = false;
      this.dragEntity = clickedEntity;
      const pos = this.getEntityPositions().get(clickedEntity.name)!;
      this.dragOffset = {
        x: worldPos.x - pos.x,
        y: worldPos.y - pos.y
      };
      this.canvas.style.cursor = 'move';
    } else if (this.getEntities().length > 0) {
      this.isPanning = true;
      this.isDragging = false;
      this.dragEntity = null;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = 'grabbing';
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown) {
      // Show cursor hint when hovering
      if (this.getEntities().length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const worldPos = this.viewportManager.screenToWorld(e.clientX, e.clientY, rect);
        const hoveredEntity = this.isPointInEntity(worldPos.x, worldPos.y);
        this.canvas.style.cursor = hoveredEntity ? 'pointer' : 'default';
      } else {
        this.canvas.style.cursor = 'default';
      }
      return;
    }

    if (this.isDragging && this.dragEntity) {
      // Check if we've moved enough to consider it a drag (not a click)
      const dx = Math.abs(e.clientX - this.mouseDownPos.x);
      const dy = Math.abs(e.clientY - this.mouseDownPos.y);
      if (dx > CanvasInteractionHandler.CLICK_THRESHOLD || dy > CanvasInteractionHandler.CLICK_THRESHOLD) {
        this.hasMoved = true;
      }

      const rect = this.canvas.getBoundingClientRect();
      const worldPos = this.viewportManager.screenToWorld(e.clientX, e.clientY, rect);
      this.updateEntityPosition(
        this.dragEntity.name,
        new Position({
          x: worldPos.x - this.dragOffset.x,
          y: worldPos.y - this.dragOffset.y
        })
      );
      this.onRender();
    } else if (this.isPanning) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      this.viewportManager.pan(dx, dy);
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      this.onRender();
    }
  }

  private handleMouseUp(e?: MouseEvent): void {
    const wasOnEntity = this.dragEntity;
    const didNotMove = !this.hasMoved;
    const wasMouseDown = this.isMouseDown;

    this.isMouseDown = false;
    this.isDragging = false;
    this.isPanning = false;
    this.dragEntity = null;

    if (this.getEntities().length > 0 && e) {
      const rect = this.canvas.getBoundingClientRect();
      const worldPos = this.viewportManager.screenToWorld(e.clientX, e.clientY, rect);
      const hoveredEntity = this.isPointInEntity(worldPos.x, worldPos.y);

      // Detect click: mousedown on entity + mouseup without significant movement
      if (wasOnEntity && didNotMove && this.onEntityClick) {
        // Call click handler - if it returns true, it handled the click
        this.onEntityClick(wasOnEntity, worldPos.x, worldPos.y, e.clientX, e.clientY);
      } else if (wasMouseDown && !wasOnEntity && didNotMove && this.onBackgroundClick) {
        // Click on background (not on any entity) → deselect
        this.onBackgroundClick();
      }

      this.canvas.style.cursor = hoveredEntity ? 'pointer' : 'default';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.viewportManager.getZoom() * zoomDelta;

    this.viewportManager.zoomToLevel(newZoom, mouseX, mouseY);
    this.onRender();
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('mousedown', this._boundMouseDown);
    this.canvas.removeEventListener('mousemove', this._boundMouseMove);
    this.canvas.removeEventListener('mouseup', this._boundMouseUp);
    this.canvas.removeEventListener('mouseleave', this._boundMouseUp);
    this.canvas.removeEventListener('wheel', this._boundWheel);
  }
}
