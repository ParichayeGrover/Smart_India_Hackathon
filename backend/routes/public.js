import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/public/alerts?village_id=1
router.get('/alerts', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE village_id = $1', [village_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/water-status?village_id=1
router.get('/water-status', async (req, res) => {
  const { village_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (wb.id) 
              wb.name as area, 
              wb.type,
              CASE 
                WHEN wqr.arsenic > 0.01 OR 
                     wqr.lead > 0.015 OR 
                     wqr.nitrates > 50 OR 
                     wqr.bacteria > 100 OR
                     wqr.viruses > 0 OR
                     wqr.mercury > 0.002 OR
                     wqr.cadmium > 0.005
                THEN 'Contaminated' 
                ELSE 'Safe' 
              END as status, 
              wqr.date,
              wqr.arsenic, 
              wqr.lead, 
              wqr.nitrates, 
              wqr.bacteria,
              wqr.flouride as fluoride,
              wqr.mercury,
              wqr.cadmium
       FROM water_quality_reports wqr
       JOIN water_bodies wb ON wqr.water_body_id = wb.id
       WHERE wb.village_id = $1
       ORDER BY wb.id, wqr.date DESC`,
      [village_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Public water-status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/public/my-village-data - Get water status for user's assigned village
router.get('/my-village-data', async (req, res) => {
  const { village_id } = req.query;
  
  if (!village_id) {
    return res.status(400).json({ error: 'Village ID is required' });
  }
  
  try {
    // Get village information
    const villageResult = await pool.query('SELECT id, name FROM villages WHERE id = $1', [village_id]);
    if (villageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Village not found' });
    }
    
    // Get water bodies with latest quality reports for this village
    const waterBodiesResult = await pool.query(
      `SELECT wb.id, wb.name, wb.type,
              latest_wqr.status,
              latest_wqr.date as last_updated,
              latest_wqr.ph, latest_wqr.nitrates, latest_wqr.flouride as fluoride, 
              latest_wqr.arsenic, latest_wqr.ecoli, latest_wqr.tds,
              latest_wqr.lead, latest_wqr.mercury, latest_wqr.cadmium,
              latest_wqr.bacteria, latest_wqr.viruses
       FROM water_bodies wb
       LEFT JOIN (
         SELECT DISTINCT ON (water_body_id) 
                water_body_id,
                CASE 
                  WHEN ph < 6.5 OR ph > 8.5 OR 
                       nitrates > 50 OR 
                       flouride > 1.5 OR 
                       arsenic > 0.01 OR 
                       ecoli > 0 OR 
                       tds > 500 OR
                       lead > 0.015 OR
                       mercury > 0.002 OR
                       cadmium > 0.005 OR
                       bacteria > 100 OR
                       viruses > 0
                  THEN 'Contaminated' 
                  ELSE 'Safe' 
                END as status,
                date, ph, nitrates, flouride, arsenic, ecoli, tds,
                lead, mercury, cadmium, bacteria, viruses
         FROM water_quality_reports 
         ORDER BY water_body_id, date DESC
       ) latest_wqr ON wb.id = latest_wqr.water_body_id
       WHERE wb.village_id = $1
       ORDER BY wb.name`,
      [village_id]
    );

    // Get alerts for this village
    const alertsResult = await pool.query(
      'SELECT * FROM alerts WHERE village_id = $1 ORDER BY date DESC LIMIT 10',
      [village_id]
    );

    // Calculate summary statistics
    const totalWaterBodies = waterBodiesResult.rows.length;
    const safeWaterBodies = waterBodiesResult.rows.filter(wb => wb.status === 'Safe').length;
    const contaminatedWaterBodies = waterBodiesResult.rows.filter(wb => wb.status === 'Contaminated').length;
    const unknownWaterBodies = waterBodiesResult.rows.filter(wb => !wb.status).length;

    res.json({
      village: villageResult.rows[0],
      waterBodies: waterBodiesResult.rows,
      alerts: alertsResult.rows,
      summary: {
        total: totalWaterBodies,
        safe: safeWaterBodies,
        contaminated: contaminatedWaterBodies,
        unknown: unknownWaterBodies
      }
    });
  } catch (err) {
    console.error('Public my-village-data error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
