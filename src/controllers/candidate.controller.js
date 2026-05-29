const supabase = require('../config/supabase');

const mapCandidate = (candidate) => ({
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.role,
    department: candidate.department,
    totalFee: candidate.total_fee,
    paidAmount: candidate.paid_amount,
    dueAmount: candidate.due_amount,
    status: candidate.status,
    remark: candidate.remark,
    createdAt: candidate.created_at
});

exports.createCandidate = async (req, res) => {
    try {
        const { name, email, phone, role, department, totalFee, paidAmount, dueAmount, status, remark } = req.body;
        
        // Prevent duplicates
        const { data: existingCandidates } = await supabase
            .from('candidates')
            .select('id')
            .or(`email.eq.${email},phone.eq.${phone}`);

        if (existingCandidates && existingCandidates.length > 0) {
            return res.status(400).json({ success: false, message: 'A candidate with this email or phone number already exists' });
        }

        const { data: candidate, error } = await supabase
            .from('candidates')
            .insert([{
                name,
                email,
                phone,
                role,
                department,
                total_fee: totalFee,
                paid_amount: paidAmount,
                due_amount: dueAmount,
                status,
                remark
            }])
            .select()
            .single();

        if (error) throw error;
        
        res.status(201).json({ success: true, data: mapCandidate(candidate) });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getCandidates = async (req, res) => {
    try {
        const { data: candidates, error } = await supabase
            .from('candidates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        const responseData = (candidates || []).map(mapCandidate);
        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCandidate = async (req, res) => {
    try {
        const { data: candidate, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        res.status(200).json({ success: true, data: mapCandidate(candidate) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCandidate = async (req, res) => {
    try {
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.phone) updateData.phone = req.body.phone;
        if (req.body.role) updateData.role = req.body.role;
        if (req.body.department) updateData.department = req.body.department;
        if (req.body.totalFee !== undefined) updateData.total_fee = req.body.totalFee;
        if (req.body.paidAmount !== undefined) updateData.paid_amount = req.body.paidAmount;
        if (req.body.dueAmount !== undefined) updateData.due_amount = req.body.dueAmount;
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.remark !== undefined) updateData.remark = req.body.remark;

        const { data: candidate, error } = await supabase
            .from('candidates')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }
        res.status(200).json({ success: true, data: mapCandidate(candidate) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const { error } = await supabase
            .from('candidates')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
